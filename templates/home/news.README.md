# News 首页模板使用说明

## 模板文件

`templates/home/news.njk` - 新闻首页模板

## 数据结构

模板需要以下数据结构：

### siteConfig (站点配置)

```json
{
  "siteConfig": {
    "homeUrl": "/",
    "logo": "/logo/logo.png",
    "siteName": "HOXILK",
    "siteDomain": "hoxilk.net",
    "menuIcon": "/icon/menu.png",
    "footerDescription": "Insights, stories, and updates.",
    "currentYear": "2025",
    "poweredBy": "Powered by Website Factory"
  }
}
```

### navigation (导航链接)

```json
{
  "navigation": [
    {
      "url": "/1962",
      "label": "Travel"
    },
    {
      "url": "/1963",
      "label": "Beauty"
    }
  ]
}
```

### featuredArticle (主要文章)

```json
{
  "featuredArticle": {
    "id": 8608,
    "categoryId": 1964,
    "url": "/detail/1964/8608",
    "title": "文章标题",
    "author": "作者名称（可选）",
    "publishTime": "2025-08-23 05:56:40",
    "date": "2025-08-23 05:56:40",
    "image": "图片URL（可选）",
    "description": "文章描述（可选）"
  }
}
```

### sidebarNews (侧边栏新闻列表)

```json
{
  "sidebarNews": [
    {
      "id": 6841,
      "categoryId": 1962,
      "url": "/detail/1962/6841",
      "title": "文章标题",
      "author": "作者名称（可选）",
      "publishTime": "2025-08-09 06:56:36",
      "date": "2025-08-09 06:56:36",
      "image": "图片URL（可选）",
      "description": "文章描述（可选）"
    }
  ]
}
```

### mobileNews (移动端新闻列表)

```json
{
  "mobileNews": [
    {
      "id": 6841,
      "categoryId": 1962,
      "url": "/detail/1962/6841",
      "title": "文章标题",
      "author": "作者名称（可选）",
      "publishTime": "2025-08-09 06:56:36",
      "date": "2025-08-09 06:56:36"
    }
  ]
}
```

### cardColumn (卡片列)

```json
{
  "cardColumn": [
    {
      "id": 8618,
      "categoryId": 1964,
      "url": "/detail/1964/8618",
      "title": "文章标题",
      "author": "作者名称（可选）",
      "publishTime": "2025-08-15 13:50:45",
      "date": "2025-08-15 13:50:45",
      "image": "图片URL（可选）"
    }
  ]
}
```

### rightSidebarNews (右侧边栏新闻)

```json
{
  "rightSidebarNews": [
    {
      "id": 8620,
      "categoryId": 1964,
      "url": "/detail/1964/8620",
      "title": "文章标题",
      "author": "作者名称（可选）",
      "publishTime": "2025-08-20 08:19:29",
      "date": "2025-08-20 08:19:29",
      "image": "图片URL（可选）",
      "description": "文章描述（可选）"
    }
  ]
}
```

### bottomNewsList (底部新闻列表)

```json
{
  "bottomNewsList": [
    {
      "id": 8837,
      "categoryId": 1964,
      "url": "/detail/1964/8837",
      "title": "文章标题",
      "author": "作者名称（可选）",
      "publishTime": "2025-08-15 01:30:24",
      "date": "2025-08-15 01:30:24",
      "image": "图片URL（可选）"
    }
  ]
}
```

### latestArticles (最新文章)

```json
{
  "latestArticles": [
    {
      "id": 8608,
      "categoryId": 1964,
      "url": "/detail/1964/8608",
      "title": "文章标题",
      "author": "作者名称（可选）",
      "publishTime": "2025-08-23 05:56:40",
      "date": "2025-08-23 05:56:40"
    }
  ]
}
```

### footerNavigation (页脚导航)

```json
{
  "footerNavigation": [
    {
      "title": "Navigation",
      "url": "/",
      "items": [
        {
          "url": "/1962",
          "label": "Travel"
        }
      ]
    }
  ]
}
```

## URL 生成规则

如果文章项没有 `url` 字段，模板会自动生成 URL：

```
/detail/{categoryId}/{id}
```

例如：
- `categoryId: 1964, id: 8608` → `/detail/1964/8608`

## 可选字段

所有字段都是可选的，模板会处理以下情况：

1. **图片不存在**: 显示占位符 `bg-gray-100`
2. **作者不存在**: 不显示作者信息
3. **描述不存在**: 不显示描述
4. **URL不存在**: 自动生成 URL

## 使用示例

### 在 Node.js 中使用

```javascript
const nunjucks = require('nunjucks');
const data = require('./news.example.json');

nunjucks.configure('templates', {
  autoescape: true
});

const html = nunjucks.render('home/news.njk', data);
```

### 在 Express 中使用

```javascript
app.get('/news', (req, res) => {
  const data = {
    siteConfig: { ... },
    navigation: [ ... ],
    featuredArticle: { ... },
    // ... 其他数据
  };
  
  res.render('home/news.njk', data);
});
```

## 完整示例数据

参考 `news.example.json` 文件查看完整的数据结构示例。
