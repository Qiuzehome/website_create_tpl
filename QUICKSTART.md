# 快速开始指南

## 1. 安装依赖

```bash
npm install
```

## 2. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3002` 启动。

## 3. 访问模板

### 首页
- 默认模板: `http://localhost:3002/`
- 自定义模板: `http://localhost:3002/?template=模板名称`

### 模板页面
- 自定义模板： http://localhost:3002/tpl/index/games

### 获取数据拼接
- http://localhost:3002/tpl/index/games?type={games|news}

## 4. 添加新模板

### 添加首页模板

1. 在 `templates/index/` 目录下创建新模板文件，如 `v2.njk`
2. 访问 `http://localhost:3002/?template=v2`

### 添加详情页模板

1. 在 `templates/detail/` 目录下创建新模板文件，如 `product.njk`
2. 访问 `http://localhost:3002/detail/product`

### 添加分类页模板

1. 在 `templates/category/` 目录下创建新模板文件
2. 访问 `http://localhost:3002/category/模板名称`

### 添加协议类页面模板

1. 在 `templates/agreement/` 目录下创建新模板文件
2. 访问 `http://localhost:3002/agreement/模板名称`

## 5. 模板结构

### 基础模板结构

```njk
{% extends "layouts/base.njk" %}

{% block title %}{{ title }} - 页面标题{% endblock %}

{% block content %}
<div class="container">
  <h1>页面内容</h1>
  <!-- 你的内容 -->
</div>
{% endblock %}
```

### 使用组件

```njk
{% include "partials/features.njk" %}
```

### 使用变量

```njk
<h1>{{ title }}</h1>
<p>页面类型: {{ pageType }}</p>
<p>模板名称: {{ templateName }}</p>
```

## 6. 静态资源

### CSS 文件

在 `public/css/` 目录下添加样式文件，在模板中引用：

```njk
{% block head %}
<link rel="stylesheet" href="/staticcss/your-style.css">
{% endblock %}
```

### JavaScript 文件

在 `public/js/` 目录下添加 JavaScript 文件，在模板中引用：

```njk
{% block scripts %}
<script src="/staticjs/your-script.js"></script>
{% endblock %}
```

### 图片资源

在 `public/images/` 目录下添加图片文件，在模板中引用：

```njk
<img src="/staticimages/logo.png" alt="Logo">
```

## 7. 目录结构

```
templates/
├── index/          # 首页模板
├── detail/        # 详情页模板
├── category/      # 分类页模板
├── agreement/     # 协议类页面模板
├── layouts/       # 布局模板
└── partials/      # 组件模板

public/
├── css/           # 样式文件
├── js/            # JavaScript 文件
└── images/        # 图片资源
```

## 8. 页面类型说明

### 首页 (index)
用于网站首页，通常包含：
- 轮播图
- 特色内容
- 最新动态
- 导航菜单

### 详情页 (detail)
用于内容详情页面，通常包含：
- 文章标题
- 发布时间
- 作者信息
- 正文内容
- 相关推荐

### 分类页 (category)
用于分类列表页面，通常包含：
- 分类导航
- 内容列表
- 分页
- 筛选条件

### 协议类页面 (agreement)
用于协议、条款等页面，通常包含：
- 协议标题
- 协议内容
- 同意按钮
- 更新日期

## 9. 最佳实践

1. **命名规范**: 使用有意义的模板文件名，如 `product-detail.njk`、`news-list.njk`
2. **模板复用**: 将可复用的组件放在 `partials/` 目录中
3. **布局继承**: 使用 `layouts/base.njk` 作为基础布局
4. **样式管理**: 通用样式放在 `public/css/common.css`，特定页面样式单独文件
5. **组件化**: 将页面拆分为多个组件，提高可维护性

## 10. 常见问题

### 模板未找到

确保：
1. 模板文件在正确的目录下（`templates/index/`、`templates/detail/` 等）
2. 文件扩展名为 `.njk`
3. 模板路径正确

### 静态资源未加载

确保：
1. 静态资源文件在 `public/` 目录下
2. 访问路径正确：`/staticcss/...`、`/staticjs/...`、`/staticimages/...`

### 页面路由错误

确保：
1. URL 路径正确
2. 模板文件存在
3. 服务器正在运行

## 11. 下一步

- 查看 [README.md](./README.md) 了解详细功能
- 查看 [Nunjucks 官方文档](https://mozilla.github.io/nunjucks/) 了解更多模板语法
