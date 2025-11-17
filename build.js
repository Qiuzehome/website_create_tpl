const path = require('path');
const fs = require('fs');

// 目录配置
const templatesPath = path.join(__dirname, 'templates');
const publicPath = path.join(__dirname, 'public');
const distPath = path.join(__dirname, 'dist');

// 统计信息
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: []
};

// 工具函数：同步递归复制目录和文件
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyDirSync(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 清理并创建输出目录
function setupDistDirectory() {
  // 删除旧的 dist 目录
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('🧹 清理旧的构建目录...');
  }

  // 创建 dist 目录
  fs.mkdirSync(distPath, { recursive: true });
  console.log('📁 创建构建目录: dist/\n');

  // 复制 public 资源到 dist/static 目录
  if (fs.existsSync(publicPath)) {
    copyDirSync(publicPath, path.join(distPath, 'static'));
    console.log('📦 已将 public 资源打包进 dist/static 目录\n');
  }
}

// 查找模板文件
function findTemplateFile(templatePath, currentDir = '') {
  const pathsToTry = [
    path.join(templatesPath, templatePath),
    path.join(templatesPath, currentDir, templatePath),
    path.join(templatesPath, path.normalize(templatePath))
  ];

  for (const tryPath of pathsToTry) {
    if (fs.existsSync(tryPath)) {
      return tryPath;
    }
  }
  throw new Error(`模板文件未找到: ${templatePath} (当前目录: ${currentDir})`);
}

// 读取模板文件内容
function readTemplateFile(templatePath, currentDir = '') {
  const fullPath = findTemplateFile(templatePath, currentDir);
  return fs.readFileSync(fullPath, 'utf8');
}

// 获取模板的相对路径（用于后续查找）
function getTemplateRelativePath(templatePath, currentDir = '') {
  const fullPath = findTemplateFile(templatePath, currentDir);
  return path.relative(templatesPath, fullPath).replace(/\\/g, '/');
}

// 解析 extends 指令
function parseExtends(content) {
  const extendMatch = content.match(/^{%\s*extends\s+["']([^"']+)["']\s*%}/);
  if (extendMatch) {
    return extendMatch[1];
  }
  return null;
}

// 解析所有 block 定义
function parseBlocks(content) {
  const blocks = new Map();
  const blockRegex = /{%\s*block\s+(\w+)\s*%}([\s\S]*?){%\s*endblock\s*%}/g;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const blockName = match[1];
    const blockContent = match[2];
    blocks.set(blockName, blockContent);
  }
  return blocks;
}

// 解析所有 include 指令（返回匹配信息，包括位置）
function findIncludes(content) {
  const includes = [];
  const includeRegex = /{%\s*include\s+["']([^"']+)["']\s*%}/g;
  let match;
  while ((match = includeRegex.exec(content)) !== null) {
    includes.push({
      match: match[0],
      path: match[1],
      index: match.index,
      length: match[0].length
    });
  }
  return includes.sort((a, b) => b.index - a.index);
}

// 处理 include：替换 include 指令为实际内容
function processIncludes(content, templateDir = '') {
  const includes = findIncludes(content);

  if (includes.length === 0) {
    return content;
  }

  for (const include of includes) {
    try {
      const includeRelativePath = getTemplateRelativePath(include.path, templateDir);
      const includeDir = path.dirname(includeRelativePath).replace(/\\/g, '/');
      let includeContent = readTemplateFile(include.path, templateDir);
      includeContent = processIncludes(includeContent, includeDir);
      content = content.substring(0, include.index) +
        includeContent +
        content.substring(include.index + include.length);
    } catch (error) {
      throw new Error(`处理 include "${include.path}" 时出错: ${error.message}`);
    }
  }

  return content;
}

// 处理 extends：将 block 内容合并到基础模板中
function processExtends(content, templateDir = '') {
  const extendsPath = parseExtends(content);

  if (!extendsPath) {
    return processIncludes(content, templateDir);
  }

  const childBlocks = parseBlocks(content);

  let basePath = extendsPath;
  let baseDir = '';

  try {
    const baseRelativePath = getTemplateRelativePath(extendsPath, templateDir);
    baseDir = path.dirname(baseRelativePath).replace(/\\/g, '/');
    basePath = extendsPath;
  } catch (error) {
    basePath = extendsPath;
    baseDir = templateDir;
  }

  let baseContent = readTemplateFile(basePath, templateDir);
  baseContent = processExtends(baseContent, baseDir);
  baseContent = processIncludes(baseContent, baseDir);
  baseContent = baseContent.replace(/({%\s*block\s+(\w+)\s*%})([\s\S]*?)({%\s*endblock\s*%})/g, (match, startTag, blockName, defaultContent, endTag) => {
    if (childBlocks.has(blockName)) {
      const childContent = childBlocks.get(blockName);
      const processedChildContent = processIncludes(childContent, templateDir);
      return `${startTag}${processedChildContent}${endTag}`;
    } else {
      return match;
    }
  });

  baseContent = baseContent.replace(/\n{3,}/g, '\n\n');
  return baseContent;
}

// 构建完整的模板文件
function buildTemplate(template) {
  try {
    const templatePath = path.join(templatesPath, template.path);
    let content = fs.readFileSync(templatePath, 'utf8');
    const templateDir = path.dirname(template.path).replace(/\\/g, '/');
    content = processExtends(content, templateDir);
    content = content.replace(/\n{3,}/g, '\n\n').trim();

    let outputPath;
    outputPath = path.join(distPath, template.type, `${template.name}.njk`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
    stats.success++;

    return {
      success: true,
      outputPath: path.relative(__dirname, outputPath)
    };
  } catch (error) {
    stats.failed++;
    stats.errors.push({
      template: template.path,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

// 获取所有模板文件
function getAllTemplates() {
  const templates = [];

  function traverseDir(dir, currentType) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        traverseDir(fullPath, `${currentType}/${file.name}`);
      } else if (file.isFile() && file.name.endsWith('.njk')) {
        const name = file.name.replace('.njk', '');
        const relativePath = path.relative(templatesPath, fullPath).replace(/\\/g, '/');
        templates.push({
          type: currentType,
          name,
          path: relativePath
        });
      }
    });
  }
  traverseDir(templatesPath, '');

  // 附加css字段：public/下寻找同名.css，规则如下：
  // 1. 优先查找 static/[type]/[name].css
  // 2. 退而查找 static/[type].css
  // 3. 退而查找 static/[name].css
  // 4. 最后不填
  return templates.map(item => {
    let cssPath = '';
    const typePath = item.type.replace(/^\//, '');
    const staticDir = 'static';
    const pathsToTry = [
      typePath && item.name ? path.join(staticDir, typePath, `${item.name}.css`) : '',
      typePath ? path.join(staticDir, `${typePath}.css`) : '',
      item.name ? path.join(staticDir, `${item.name}.css`) : ''
    ];
    for (const p of pathsToTry) {
      if (p && fs.existsSync(path.join(distPath, p))) {
        cssPath = p.replace(/\\/g, '/');
        break;
      }
    }

    return {
      ...item,
      type: item.type.replace(/^\//, ''),
      css: cssPath
    };
  });
}

// 主构建函数
function build() {
  console.log('🚀 开始构建模板...\n');

  // 设置输出目录，包含复制 public
  setupDistDirectory();

  // 获取所有模板，附带css
  const templates = getAllTemplates();
  stats.total = templates.length;

  if (stats.total === 0) {
    console.log('⚠️  未找到任何模板文件');
    process.exit(0);
  }

  const outJsonPath = path.join(distPath, `tpl.json`);
  fs.writeFileSync(outJsonPath, JSON.stringify(templates, null, 2), 'utf8');

  console.log(`📋 找到 ${stats.total} 个模板文件:\n`);

  templates.forEach(template => {
    const result = buildTemplate(template);

    if (result.success) {
      console.log(`✅ ${template.path} → ${result.outputPath}`);
    } else {
      console.log(`❌ ${template.path}`);
      console.log(`   错误: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('📊 构建统计:');
  console.log(`   总数: ${stats.total}`);
  console.log(`   成功: ${stats.success}`);
  console.log(`   失败: ${stats.failed}`);
  console.log(`   输出目录: dist/`);
  console.log('='.repeat(50));

  if (stats.errors.length > 0) {
    console.log('\n❌ 构建失败，发现以下错误:\n');
    stats.errors.forEach(err => {
      console.log(`   模板: ${err.template}`);
      console.log(`   错误: ${err.error}`);
      console.log('');
    });
    process.exit(1);
  } else {
    console.log('\n✅ 构建成功！所有模板已展开并输出到 dist/ 目录。');
    console.log('\n💡 提示:');
    console.log('   - dist/ 目录中的 .njk 文件是完整的、独立的模板文件');
    console.log('   - 所有继承（extends）和包含（include）已展开');
    console.log('   - public/ 内资源已复制到 dist/static/ 目录，可直接按相对路径 static/ 引用');
    process.exit(0);
  }
}

build();