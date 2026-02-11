# Doc2PDF

一个强大的 Node.js 命令行工具，用于将文档型网站转换为 PDF 文件。

## 功能特点

- 🚀 自动识别网站侧边栏导航，智能发现所有文档页面
- 📄 将多个页面合并为单个 PDF 文件，带页面分隔
- 🎨 保留基本格式（标题、列表、代码块、表格等）
- 🧹 自动去除导航栏、广告等无关元素
- ⚡ 支持并发爬取，提升效率
- 🔧 灵活的配置选项

## 安装

```bash
# 克隆仓库
git clone <repository-url>
cd doc2pdf

# 安装依赖
npm install

# 全局安装（可选）
npm link
```

## 使用方法

### 基本使用

```bash
node src/index.js <url>
```

示例：
```bash
node src/index.js https://docs.example.com
```

### 命令行选项

```
-o, --output <path>        输出 PDF 文件路径（默认：./output/docs.pdf）
-s, --selector <selector>  自定义导航选择器
-c, --content <selector>   自定义内容区域选择器
-t, --timeout <ms>         页面加载超时（默认：30000ms）
--concurrency <number>     并发爬取数（默认：3）
-v, --verbose              显示详细日志
-h, --help                 显示帮助信息
```

### 使用示例

```bash
# 指定输出路径
node src/index.js https://docs.example.com -o ./my-docs.pdf

# 自定义导航选择器
node src/index.js https://docs.example.com -s ".doc-nav a"

# 自定义内容选择器
node src/index.js https://docs.example.com -c "main article"

# 设置并发数
node src/index.js https://docs.example.com --concurrency 5

# 详细模式
node src/index.js https://docs.example.com -v
```

## 配置文件

在项目根目录创建 `doc2pdf.config.js` 文件进行高级配置：

```javascript
module.exports = {
  navSelectors: [
    '.sidebar nav a',
    '.docs-sidebar a',
    // 自定义选择器
  ],
  contentSelectors: [
    'main',
    'article',
    // 自定义选择器
  ],
  timeout: 30000,
  concurrency: 3,
  excludePatterns: ['/api/', '/blog/'],
  pdfOptions: {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  }
};
```

## 支持的文档站点类型

- VuePress
- Docusaurus
- GitBook
- Read the Docs
- 其他标准文档站点

## 工作原理

1. 访问起始 URL
2. 识别侧边栏导航结构
3. 提取所有文档链接
4. 并发爬取所有页面
5. 提取主内容并清理无关元素
6. 合并所有页面为单个 HTML
7. 生成 PDF 文件

## 注意事项

- 首次运行会下载 Chromium，需要一些时间
- 爬取大型网站可能需要较长时间
- 请遵守网站的 robots.txt 和服务条款
- 建议设置合理的并发数，避免对目标网站造成压力

## 故障排除

### 找不到导航链接

使用 `-s` 参数指定自定义导航选择器：

```bash
node src/index.js <url> -s ".custom-nav a"
```

### 内容提取不完整

使用 `-c` 参数指定自定义内容选择器：

```bash
node src/index.js <url> -c ".custom-content"
```

### 页面加载超时

增加超时时间：

```bash
node src/index.js <url> -t 60000
```

## 开发

```bash
# 安装依赖
npm install

# 运行
npm start -- <url> [options]
```

## 许可证

MIT
