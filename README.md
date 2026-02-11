# Doc2PDF

一个强大的 Node.js 命令行工具，用于将文档型网站转换为 PDF 文件。

## ✨ 功能特点

- 🚀 **智能爬取**：自动识别网站侧边栏导航，智能发现所有文档页面
- 📝 **Markdown 转换**：将网页内容转换为 Markdown 后再生成 PDF，排版更清晰统一（v1.0.5）
- 📄 **多页合并**：将多个页面合并为单个 PDF 文件，带页面分隔
- 🎨 **GitHub 风格排版**：统一的标题、代码块、表格、引用样式
- 🖼️ **智能图片处理**：自动区分内容图片和小图标，合理展示尺寸（v1.0.4）
- 🧹 **内容清理**：自动去除导航栏、页眉、页脚、广告等 60+ 种无关元素
- ⚡ **并发爬取**：支持并发爬取，提升效率
- 📦 **大文档支持**：自动处理超大文档（400+ 页面），分块生成
- 🔧 **灵活配置**：支持配置文件和命令行参数
- 📉 **体积优化**：Markdown 转换后 PDF 体积减小约 25%

## 快速开始

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd doc2pdf

# 安装依赖
npm install
```

### 基本使用

```bash
# 使用便捷脚本（推荐）
./run.sh <url> <output.pdf>

# 或直接使用 node
node src/index.js <url> -o <output.pdf>
```

### 示例

```bash
# 抓取 OpenCode 文档
./run.sh https://opencode.ai/docs ./output/opencode.pdf

# 抓取 GitHub Copilot 文档
./run.sh https://docs.github.com/en/copilot ./output/copilot.pdf

# 抓取火山引擎文档（大文档示例）
./run.sh https://www.volcengine.com/docs/84129/1261502 ./output/volcengine.pdf
```

## 版本亮点

### v1.0.5 (最新) - Markdown 转换 ✨

将网页内容转换为 Markdown 格式后再生成 PDF，带来：
- ✅ 统一的 GitHub 风格排版
- ✅ 清晰的标题层级（H1/H2 带下划线）
- ✅ 优化的代码块样式（带边框和语言标记）
- ✅ 规范的表格格式（斑马纹背景）
- ✅ 美化的引用块（蓝色边框 + 背景）
- ✅ PDF 体积减小约 25%

### v1.0.4 - 图片优化

智能识别图片类型，合理展示尺寸：
- 内容图片：300-85% 页面宽度，清晰可见
- 独立图片：400-90% 页面宽度，居中展示
- 小图标：28-40px，保持内联显示

### v1.0.3 - 内容清理增强

移除 60+ 种无关元素：导航、页眉、页脚、广告、按钮、表单等

### v1.0.2 - 大文档支持

自动处理超大文档（100MB+ HTML），分块生成 PDF

## 安装

```bash
# 克隆仓库
git clone <repository-url>
cd doc2pdf

# 安装依赖
npm install
```

**系统要求**：
- Node.js 14.0+
- 内存：建议 4GB+（大文档需要 8GB+）

**依赖说明**：
- `puppeteer` - 浏览器自动化
- `cheerio` - HTML 解析
- `turndown` - HTML → Markdown 转换
- `marked` - Markdown → HTML 渲染
- `commander` - CLI 框架
- `chalk@4` - 终端彩色输出
- `ora@5` - 加载动画

## 使用方法

### 基本使用

```bash
# 使用便捷脚本（推荐，自动设置 4GB 内存）
./run.sh <url> <output.pdf>

# 直接使用 node
node src/index.js <url> -o <output.pdf>

# 大文档需要更多内存
export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB
node src/index.js <url> -o <output.pdf>
```

### 命令行选项

```
Options:
  -V, --version              输出版本号 (当前: 1.0.5)
  -o, --output <path>        输出 PDF 文件路径（默认：./output/docs.pdf）
  -s, --selector <selector>  自定义导航选择器
  -c, --content <selector>   自定义内容区域选择器
  -t, --timeout <ms>         页面加载超时（默认：30000ms）
  --concurrency <number>     并发爬取数（默认：3）
  -h, --help                 显示帮助信息
```

### 使用示例

```bash
# 指定输出路径
./run.sh https://docs.example.com ./my-docs.pdf

# 自定义导航选择器（如果自动识别失败）
node src/index.js https://docs.example.com -s ".doc-nav a" -o output.pdf

# 自定义内容选择器
node src/index.js https://docs.example.com -c "main article" -o output.pdf

# 设置并发数（爬取速度 vs 服务器压力）
node src/index.js https://docs.example.com --concurrency 5 -o output.pdf

# 增加超时时间（慢速网站）
node src/index.js https://docs.example.com -t 60000 -o output.pdf
```

## 配置文件

在项目根目录创建 `doc2pdf.config.js` 文件进行高级配置：

```javascript
module.exports = {
  // 导航选择器（按优先级尝试）
  navSelectors: [
    '.sidebar nav a',
    '.sidebar a',              // v1.0.4 新增
    '[class*="sidebar"] a',    // v1.0.4 新增：模糊匹配
    '.docs-sidebar a',
    'aside nav a',
    'aside a',
    '[role="navigation"] a',
    '.toc a',
    '.menu a',
    'nav a',
    '.nav-links a',
    '[class*="menu"] a',       // v1.0.4 新增
    '[class*="nav"] a'         // v1.0.4 新增
  ],
  
  // 内容选择器（按优先级尝试）
  contentSelectors: [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.docs-content',
    '.markdown-body',
    '#content'
  ],
  
  // 爬取配置
  timeout: 30000,        // 页面加载超时（毫秒）
  concurrency: 3,        // 并发爬取数
  
  // URL 过滤
  excludePatterns: [
    '/api/',             // 排除 API 文档
    '/blog/',            // 排除博客
    '#'                  // 排除锚点链接
  ],
  
  // PDF 生成选项
  pdfOptions: {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true
  }
};
```

参考 `doc2pdf.config.example.js` 获取完整配置示例。

## 支持的文档站点类型

已测试支持：
- ✅ **VuePress** - 如 Vue.js 官方文档
- ✅ **Docusaurus** - 如 React Native 文档
- ✅ **GitBook** - 各种开源项目文档
- ✅ **Read the Docs** - Python 项目文档
- ✅ **Nextra** - Next.js 文档框架
- ✅ **自定义文档站** - 支持配置选择器适配

测试案例：
- OpenCode.ai (34 页面) - ✅ 3.96 MB
- GitHub Copilot (288 页面) - ✅ 成功生成
- 火山引擎 (400+ 页面) - ✅ 分块生成

## 工作原理

### 完整流程

```
1. 启动浏览器 (Puppeteer)
   ↓
2. 访问起始 URL
   ↓
3. 识别侧边栏导航结构（尝试 13 种选择器）
   ↓
4. 提取所有文档链接（同源 + 去重）
   ↓
5. 并发爬取所有页面（默认 3 并发）
   ↓
6. 提取主内容区域（尝试 7 种选择器）
   ↓
7. 清理无关元素（60+ 种过滤规则）
   ↓
8. 转换为 Markdown (Turndown) ← v1.0.5 新增
   ↓
9. 渲染为统一的 HTML (Marked) ← v1.0.5 新增
   ↓
10. 应用 GitHub 风格 CSS
   ↓
11. 生成 PDF (Puppeteer)
    - 小文档：直接生成
    - 大文档（100MB+）：分块生成
```

### 关键技术

- **智能选择器策略**：尝试所有选择器，选择匹配最多的结果
- **内容清理**：移除 nav、header、footer、ads、buttons 等 60+ 种元素
- **Markdown 转换**：统一格式，消除网站差异
- **图片识别**：区分内容图片（300-85%）和小图标（28-40px）
- **内存优化**：大文档自动分块（50 页/批），避免内存溢出

## 注意事项

### ⚠️ 使用须知

- **首次运行**：会自动下载 Chromium（~150MB），需要一些时间
- **大型网站**：爬取 400+ 页面可能需要 10-30 分钟
- **内存需求**：
  - 小文档（<100 页）：2GB 内存足够
  - 中型文档（100-300 页）：4GB 内存（run.sh 默认）
  - 大型文档（300+ 页）：8GB+ 内存
- **网站礼仪**：
  - 遵守网站的 robots.txt
  - 设置合理的并发数（默认 3）
  - 避免短时间内重复爬取
  - 尊重网站的服务条款

### ✅ 最佳实践

1. **首次测试**：先用小网站测试（如单个页面）
2. **大文档处理**：
   ```bash
   export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB
   ./run.sh <url> <output.pdf>
   ```
3. **查看中间结果**：检查 `output/*_temp.html` 了解提取效果
4. **自定义选择器**：如果自动识别失败，使用 `-s` 和 `-c` 参数
5. **调试模式**：保留临时 HTML 文件用于问题排查

## 故障排除

### 问题 1：找不到导航链接（只抓到 1 个页面）

**原因**：网站使用了非标准的侧边栏结构

**解决方案**：
```bash
# 1. 打开浏览器检查侧边栏的 HTML 结构
# 2. 找到包含文档链接的选择器
# 3. 使用 -s 参数指定

node src/index.js <url> -s ".custom-sidebar a" -o output.pdf
```

**示例**：
```bash
# 如果侧边栏的类名是 doc-menu
node src/index.js <url> -s ".doc-menu a" -o output.pdf
```

### 问题 2：内容提取不完整

**原因**：内容区域选择器不匹配

**解决方案**：
```bash
# 使用浏览器开发者工具找到主内容区域的选择器
node src/index.js <url> -c ".main-content" -o output.pdf
```

### 问题 3：页面加载超时

**原因**：网站加载慢或网络不稳定

**解决方案**：
```bash
# 增加超时时间到 60 秒
node src/index.js <url> -t 60000 -o output.pdf
```

### 问题 4：PDF 生成失败 "Target closed" / 内存溢出

**原因**：文档太大，超出 Node.js 默认内存限制

**解决方案**：
```bash
# 方法 1：使用 run.sh（自动设置 4GB）
./run.sh <url> <output.pdf>

# 方法 2：手动设置 8GB 内存
export NODE_OPTIONS="--max-old-space-size=8192"
node src/index.js <url> -o output.pdf

# 方法 3：检查是否触发了分块生成
# 如果 HTML > 100MB，会自动分块生成多个 PDF
```

### 问题 5：图片显示异常

**问题表现**：
- 图片太小看不清 → 已在 v1.0.4 修复
- 图标太大影响排版 → 已在 v1.0.3 修复

**当前版本行为**：
- 内容图片：最小 300px，最大 85% 页面宽度
- 独立图片：最小 400px，最大 90% 页面宽度
- 小图标：28-40px，保持内联显示

### 问题 6：某些元素（导航/页脚）没有被移除

**解决方案**：
检查 `src/parser.js` 的 `cleanContent()` 方法，添加自定义选择器：

```javascript
// 在 cleanContent 方法中添加
$('.your-custom-class').remove();
```

### 问题 7：chalk.red is not a function

**原因**：chalk 版本不兼容（v5+ 是 ESM-only）

**解决方案**：
```bash
# 已在 package.json 中锁定版本
npm install  # 重新安装依赖
```

当前使用版本：
- chalk@4.1.2
- ora@5.4.1

## 项目文档

- **[QUICKSTART.md](QUICKSTART.md)** - 快速开始指南
- **[CHANGELOG.md](CHANGELOG.md)** - 版本更新日志
- **[MARKDOWN_FEATURE.md](MARKDOWN_FEATURE.md)** - Markdown 转换功能详解（v1.0.5）
- **[IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md)** - 图片优化策略（v1.0.4）
- **[SOLUTION_LARGE_DOCS.md](SOLUTION_LARGE_DOCS.md)** - 大文档处理方案
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - 常见问题排查
- **[TESTING.md](TESTING.md)** - 测试指南
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 项目架构概览

## 开发

### 开发环境

```bash
# 安装依赖
npm install

# 运行开发版本
npm start -- <url> -o output.pdf

# 查看版本
node src/index.js --version
```

### 项目结构

```
doc2pdf/
├── src/
│   ├── index.js              # CLI 入口
│   ├── crawler.js            # 页面爬取
│   ├── parser.js             # 内容解析 + Markdown 转换
│   ├── pdfGenerator.js       # PDF 生成（标准）
│   ├── pdfGeneratorLarge.js  # PDF 生成（大文档）
│   └── utils/
│       ├── config.js         # 配置管理
│       ├── logger.js         # 日志输出
│       └── urlHelper.js      # URL 处理
├── output/                   # 输出目录
├── run.sh                    # 便捷启动脚本
├── package.json              # 依赖配置
└── doc2pdf.config.example.js # 配置示例
```

### 技术栈

- **Puppeteer 24.x** - 浏览器自动化、PDF 生成
- **Cheerio 1.x** - HTML 解析和 DOM 操作
- **Turndown** - HTML → Markdown 转换
- **Marked** - Markdown → HTML 渲染
- **Commander 14.x** - CLI 框架
- **Chalk 4.x** - 终端彩色输出（CommonJS）
- **Ora 5.x** - 加载动画（CommonJS）

### 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 常见问题 (FAQ)

**Q: 为什么生成的 PDF 没有彩色代码高亮？**  
A: 当前版本使用统一的 GitHub 风格样式，暂不支持语法高亮。计划在未来版本集成 highlight.js。

**Q: 可以导出为 Markdown 文件吗？**  
A: 当前版本中间会生成 Markdown，但不直接导出。可以修改 `src/crawler.js` 保存 Markdown 到文件。

**Q: 支持需要登录的网站吗？**  
A: 当前不支持。需要手动修改代码添加登录逻辑。

**Q: 可以自定义 PDF 样式吗？**  
A: 可以。编辑 `src/pdfGenerator.js` 中的 CSS 部分。

**Q: 生成的 PDF 为什么是多个文件？**  
A: 当文档非常大（100MB+ HTML）时，会自动分块生成多个 PDF，避免内存溢出。每个 PDF 包含约 50 个页面。

## 版本历史

- **v1.0.5** (2026-02-11) - Markdown 转换功能，统一排版风格 ✨
- **v1.0.4** (2026-02-11) - 图片展示优化，智能识别图片类型
- **v1.0.3** (2026-02-11) - 内容清理增强，移除 60+ 种无关元素
- **v1.0.2** (2026-02-11) - 大文档支持，自动分块生成
- **v1.0.1** (2026-02-11) - 侧边栏爬取修复，选择器策略优化
- **v1.0.0** (2026-02-10) - 初始版本

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细更新日志。

## 许可证

MIT

---

Made with ❤️ by [Your Name]

## 致谢

感谢以下开源项目：
- [Puppeteer](https://pptr.dev/) - 浏览器自动化
- [Cheerio](https://cheerio.js.org/) - HTML 解析
- [Turndown](https://github.com/mixmark-io/turndown) - HTML 转 Markdown
- [Marked](https://marked.js.org/) - Markdown 解析
