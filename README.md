# Nunjucks 模板项目

用于存放和管理 Nunjucks (njk) 模板文件的项目，按页面类型分类管理。

## 项目结构

```
.
├── templates/          # 模板文件目录
│   ├── home/          # 首页模板
│   │   └── default.njk
│   ├── detail/        # 详情页模板
│   │   └── default.njk
│   ├── category/      # 分类页模板
│   │   └── default.njk
│   ├── agreement/     # 协议类页面模板
│   │   └── default.njk
│   ├── layouts/       # 布局模板
│   │   └── base.njk
│   └── partials/      # 组件模板
│       ├── features.njk
│       └── related.njk
├── public/            # 静态资源文件
│   ├── css/           # 样式文件
│   │   └── common.css
│   └── js/            # JavaScript 文件
│       └── common.js
├── server.js          # 开发服务器
├── package.json       # 项目配置
└── README.md          # 项目说明
```

## 页面类型

项目按以下页面类型组织模板：

1. **首页 (home)** - 网站首页模板
2. **详情页 (detail)** - 内容详情页面模板
3. **分类页 (category)** - 分类列表页面模板
4. **协议类页面 (agreement)** - 协议、条款等页面模板

## 安装依赖

```bash
npm install
```

## 开发

启动开发服务器预览模板：

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## 构建

将模板展开为完整的、独立的 `.njk` 文件：

```bash
npm run build
```

构建命令会：
- 检查所有模板文件是否存在
- 验证模板语法是否正确
- 展开所有继承（extends）关系
- 展开所有包含（include）关系
- 将模板合并为完整的 `.njk` 文件
- 输出构建统计信息

### 构建输出

构建完成后，所有完整的模板文件会输出到 `dist/` 目录：

```
dist/
├── home/                   # 首页目录
│   └── default.njk        # 完整的首页模板
├── detail/                 # 详情页目录
│   └── default.njk        # 完整的详情页模板
├── category/               # 分类页目录
│   └── default.njk        # 完整的分类页模板
└── agreement/              # 协议类页面目录
    └── default.njk        # 完整的协议页模板
```

### 构建特点

- **完整性**: 所有继承（extends）和包含（include）已展开
- **独立性**: 生成的 `.njk` 文件不依赖其他模板文件
- **可移植性**: 可以直接在其他项目中使用这些模板文件
- **无依赖**: 生成的模板文件不需要原始的模板目录结构

### 使用构建结果

构建后的 `dist/` 目录中的 `.njk` 文件可以：
- 直接在其他项目中使用
- 复制到其他项目的模板目录
- 作为独立的模板文件使用
- 不需要原始的 `layouts/` 和 `partials/` 目录

## 访问模板

### 首页
- 默认模板: `http://localhost:3000/` 或 `http://localhost:3000/?template=default`
- 自定义模板: `http://localhost:3000/?template=模板名称`

### 详情页
- 默认模板: `http://localhost:3000/detail` 或 `http://localhost:3000/detail/default`
- 自定义模板: `http://localhost:3000/detail/模板名称`

### 分类页
- 默认模板: `http://localhost:3000/category` 或 `http://localhost:3000/category/default`
- 自定义模板: `http://localhost:3000/category/模板名称`

### 协议类页面
- 默认模板: `http://localhost:3000/agreement` 或 `http://localhost:3000/agreement/default`
- 自定义模板: `http://localhost:3000/agreement/模板名称`

### 页面列表
访问 `http://localhost:3000/pages` 查看所有可用页面类型和模板。

## 添加新模板

### 1. 添加首页模板

在 `templates/home/` 目录下创建新模板文件，如 `templates/home/v2.njk`：

```njk
{% extends "layouts/base.njk" %}

{% block title %}{{ title }} - 首页 V2{% endblock %}

{% block content %}
<div class="container">
  <h1>首页 V2 模板</h1>
  <!-- 你的内容 -->
</div>
{% endblock %}
```

访问: `http://localhost:3000/?template=v2`

### 2. 添加详情页模板

在 `templates/detail/` 目录下创建新模板文件，如 `templates/detail/product.njk`：

```njk
{% extends "layouts/base.njk" %}

{% block title %}{{ title }} - 产品详情页{% endblock %}

{% block content %}
<div class="container">
  <h1>产品详情页</h1>
  <!-- 你的内容 -->
</div>
{% endblock %}
```

访问: `http://localhost:3000/detail/product`

### 3. 添加分类页模板

在 `templates/category/` 目录下创建新模板文件。

### 4. 添加协议类页面模板

在 `templates/agreement/` 目录下创建新模板文件。

## 模板使用

### 继承布局

```njk
{% extends "layouts/base.njk" %}

{% block title %}页面标题{% endblock %}

{% block content %}
  <h1>页面内容</h1>
{% endblock %}
```

### 引入组件

```njk
{% include "partials/features.njk" %}
```

### 变量和循环

```njk
<h1>{{ title }}</h1>

{% for item in items %}
  <li>{{ item }}</li>
{% endfor %}
```

## 静态资源

### CSS 文件

在 `public/css/` 目录下添加样式文件，在模板中引用：

```njk
{% block head %}
<link rel="stylesheet" href="/static/css/your-style.css">
{% endblock %}
```

### JavaScript 文件

在 `public/js/` 目录下添加 JavaScript 文件，在模板中引用：

```njk
{% block scripts %}
<script src="/static/js/your-script.js"></script>
{% endblock %}
```

## 目录说明

### templates/

- `home/` - 首页模板目录
- `detail/` - 详情页模板目录
- `category/` - 分类页模板目录
- `agreement/` - 协议类页面模板目录
- `layouts/` - 布局模板目录（所有页面共享）
- `partials/` - 组件模板目录（可复用组件）

### public/

- `css/` - 样式文件目录
- `js/` - JavaScript 文件目录
- `images/` - 图片资源目录（可选）

## 最佳实践

1. **命名规范**: 使用有意义的模板文件名，如 `product-detail.njk`、`news-list.njk`
2. **模板复用**: 将可复用的组件放在 `partials/` 目录中
3. **布局继承**: 使用 `layouts/base.njk` 作为基础布局，通过 `extends` 继承
4. **样式管理**: 通用样式放在 `public/css/common.css`，特定页面样式单独文件
5. **组件化**: 将页面拆分为多个组件，提高可维护性

## Nunjucks 语法

参考 [Nunjucks 官方文档](https://mozilla.github.io/nunjucks/)