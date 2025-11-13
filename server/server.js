const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const { fetchData } = require('./fetch');

const app = express();
const PORT = process.env.PORT || 3002;

// 模板目录配置
const rootDir = path.resolve(__dirname, '..');
const templatesPath = path.join(rootDir, 'templates');
const publicPath = path.join(rootDir, 'public');

// 页面类型配置
const pageTypes = {
  home: '首页',
  detail: '详情页',
  category: '分类页',
  agreement: '协议类页面'
};

// 配置 Nunjucks 环境
// 检查是否为开发模式
const isDev = process.env.NODE_ENV !== 'production';

const env = nunjucks.configure(templatesPath, {
  autoescape: true,
  express: app,
  watch: isDev, // 开发模式下自动重新加载模板
  noCache: isDev
});

// 静态文件服务
app.use('/tpl_static', express.static(publicPath));

// 首页路由
app.get('/', (req, res) => {
  const templateName = req.query.tpl || 'default';
  try {
    res.render(`home/${templateName}.njk`, {
      title: '首页',
      pageType: 'home',
      templateName: templateName
    });
  } catch (error) {
    res.status(404).send(`模板未找到: home/${templateName}.njk`);
  }
});

app.get('/tpl/:path', (req, res) => {
  const pathParam = req.params.path;
  try {
    res.render(`${pathParam}/default.njk`, {
      title: '首页',
      pageType: { pathParam },
      templateName: 'default'
    });
  } catch (error) {
    res.status(404).send(`${pathParam}/default.njk`);
  }
});

app.get('/tpl/:path/:tpl', async (req, res) => {
  const pathParam = req.params.path;
  const tplParam = req.params.tpl;
  const type = req.query.type;
  let configData = {};
  try {
    configData = await fetchData(type);
  } catch (e) {
    return res.status(500).send('数据获取失败');
  }

  const templateName = `${tplParam}/index`;
  console.log(configData)
  try {
    res.render(`${pathParam}/${templateName}.njk`, Object.assign({
      title: '首页',
      pageType: { pathParam },
      templateName: templateName
    }, configData));
  } catch (error) {
    res.status(404).send(`${pathParam}/${templateName}.njk`);
  }
});


// 启动服务器
app.listen(PORT, () => {
  console.log(`模板服务器运行在 http://localhost:${PORT}`);
  console.log(`\n可用页面类型:`);
  Object.keys(pageTypes).forEach(type => {
    console.log(`  - ${pageTypes[type]} (/${type})`);
  });
});