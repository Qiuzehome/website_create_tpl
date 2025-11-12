const path = require('path');
const fs = require('fs');

// 目录配置
const templatesPath = path.join(__dirname, 'templates');
const distPath = path.join(__dirname, 'dist');

// 页面类型配置
const pageTypes = {
  home: '首页',
  detail: '详情页',
  category: '分类页',
  agreement: '协议类页面'
};

// 统计信息
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: []
};

const outJson = {
  path: [
    { name: "home", tpl: ["defualt"] }
  ]
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
}

// 查找模板文件
function findTemplateFile(templatePath, currentDir = '') {
  // 尝试多种路径
  const pathsToTry = [
    // 绝对路径（从 templates 根目录）
    path.join(templatesPath, templatePath),
    // 相对于当前目录
    path.join(templatesPath, currentDir, templatePath),
    // 相对于 templates 根目录
    path.join(templatesPath, path.normalize(templatePath))
  ];

  for (const tryPath of pathsToTry) {
    if (fs.existsSync(tryPath)) {
      return tryPath;
    }
  }

  // 如果都不存在，抛出错误
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
    // 保留原始的 block 内容，包括前后的空白
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

  // 按索引从大到小排序，这样从后往前替换时索引不会变化
  return includes.sort((a, b) => b.index - a.index);
}

// 处理 include：替换 include 指令为实际内容
function processIncludes(content, templateDir = '') {
  const includes = findIncludes(content);

  if (includes.length === 0) {
    return content;
  }

  // 从后往前处理，避免索引变化
  for (const include of includes) {
    try {
      // 获取被包含文件的路径
      const includeRelativePath = getTemplateRelativePath(include.path, templateDir);
      const includeDir = path.dirname(includeRelativePath).replace(/\\/g, '/');

      // 读取被包含的文件
      let includeContent = readTemplateFile(include.path, templateDir);

      // 递归处理被包含文件中的 includes
      includeContent = processIncludes(includeContent, includeDir);

      // 替换 include 指令为实际内容
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
    // 没有 extends，只处理 includes
    return processIncludes(content, templateDir);
  }

  // 先解析当前模板的 blocks（在移除之前）
  const childBlocks = parseBlocks(content);

  // 获取基础模板的路径
  let basePath = extendsPath;
  let baseDir = '';

  try {
    const baseRelativePath = getTemplateRelativePath(extendsPath, templateDir);
    baseDir = path.dirname(baseRelativePath).replace(/\\/g, '/');
    basePath = extendsPath;
  } catch (error) {
    // 如果找不到文件，尝试其他路径
    basePath = extendsPath;
    baseDir = templateDir;
  }

  // 读取基础模板
  let baseContent = readTemplateFile(basePath, templateDir);

  // 递归处理基础模板的 extends（先处理继承链）
  baseContent = processExtends(baseContent, baseDir);

  // 处理基础模板中的 includes
  baseContent = processIncludes(baseContent, baseDir);

  // 替换基础模板中的 block 为子模板的 block 内容
  baseContent = baseContent.replace(/({%\s*block\s+(\w+)\s*%})([\s\S]*?)({%\s*endblock\s*%})/g, (match, startTag, blockName, defaultContent, endTag) => {
    if (childBlocks.has(blockName)) {
      // 使用子模板的 block 内容
      const childContent = childBlocks.get(blockName);
      // 处理子 block 中的 includes（如果有）
      const processedChildContent = processIncludes(childContent, templateDir);
      return `${startTag}${processedChildContent}${endTag}`;
    } else {
      // 保留基础模板的默认内容
      return match;
    }
  });

  // 清理多余的空白行
  baseContent = baseContent.replace(/\n{3,}/g, '\n\n');

  return baseContent;
}

// 构建完整的模板文件
function buildTemplate(template) {
  try {
    const templatePath = path.join(templatesPath, template.path);
    let content = fs.readFileSync(templatePath, 'utf8');

    // 获取模板所在目录
    const templateDir = path.dirname(template.path).replace(/\\/g, '/');

    // 处理 extends 和 includes，生成完整的模板
    content = processExtends(content, templateDir);

    // 清理多余的空白行
    content = content.replace(/\n{3,}/g, '\n\n').trim();

    // 确定输出路径
    let outputPath;

    if (template.type === 'home') {
      outputPath = path.join(distPath, 'home', `${template.name}.njk`);
    } else {
      outputPath = path.join(distPath, template.type, `${template.name}.njk`);
    }

    // 确保输出目录存在
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // 保存完整的模板文件
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

  // 递归遍历目录的函数
  function traverseDir(dir, currentType) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        // 若为目录，继续递归遍历，拼接类型（如 home/news）
        traverseDir(fullPath, `${currentType}/${file.name}`);
      } else if (file.isFile() && file.name.endsWith('.njk')) {
        // 若为 .njk 文件，收集信息
        const name = file.name.replace('.njk', '');
        const relativePath = path.relative(templatesPath, fullPath).replace(/\\/g, '/');
        templates.push({
          type: currentType, // 完整类型路径，如 home/news
          name,
          path: relativePath // 相对于 templates 的路径，如 home/news/default.njk
        });
      }
    });
  }

  // 从 templates 根目录开始遍历，初始类型为空
  traverseDir(templatesPath, '');

  // 去除类型开头的斜杠（若有的话）
  return templates.map(item => ({
    ...item,
    type: item.type.replace(/^\//, '')
  }));
}

// 主构建函数
function build() {
  console.log('🚀 开始构建模板...\n');

  // 设置输出目录
  setupDistDirectory();

  // 获取所有模板
  const templates = getAllTemplates();
  stats.total = templates.length;

  if (stats.total === 0) {
    console.log('⚠️  未找到任何模板文件');
    process.exit(0);
  }

  const outJsonPath = path.join(distPath, `tpl.json`);
  //输出模板配置文件
  fs.writeFileSync(outJsonPath, JSON.stringify(templates), 'utf8');

  console.log(`📋 找到 ${stats.total} 个模板文件:\n`);

  // 构建每个模板
  templates.forEach(template => {
    const result = buildTemplate(template);

    if (result.success) {
      console.log(`✅ ${template.path} → ${result.outputPath}`);
    } else {
      console.log(`❌ ${template.path}`);
      console.log(`   错误: ${result.error}`);
    }
  });

  // 输出统计信息
  console.log('\n' + '='.repeat(50));
  console.log('📊 构建统计:');
  console.log(`   总数: ${stats.total}`);
  console.log(`   成功: ${stats.success}`);
  console.log(`   失败: ${stats.failed}`);
  console.log(`   输出目录: dist/`);
  console.log('='.repeat(50));

  // 如果有错误，输出详细信息
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
    console.log('   - 可以直接在其他项目中使用这些模板文件');
    process.exit(0);
  }
}

// 运行构建
build();