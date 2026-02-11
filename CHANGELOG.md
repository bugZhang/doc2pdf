# 更新日志

## [1.0.5] - 2026-02-11

### ✨ 重大更新：Markdown 格式转换

**将网页内容转换为 Markdown 后再生成 PDF，排版更清晰、更易读**

- **核心功能**：
  - ✅ HTML → Markdown → HTML → PDF 的转换流程
  - ✅ 使用 `turndown` 库将 HTML 转为 Markdown
  - ✅ 使用 `marked` 库将 Markdown 渲染为格式良好的 HTML
  - ✅ 统一的 Markdown 排版风格（GitHub Flavored Markdown）
  
- **排版优化**：
  - ✅ **标题样式**：层级清晰，H1/H2 带下划线分隔
  - ✅ **代码块**：GitHub 风格，带边框和背景，语法高亮标记保留
  - ✅ **表格**：斑马纹背景，边框清晰，单元格间距合理
  - ✅ **引用块**：蓝色左边框，浅灰背景，斜体文字
  - ✅ **列表**：层级缩进清晰，嵌套列表间距合理
  - ✅ **链接**：蓝色加粗，悬停下划线
  - ✅ **页眉**：渐变背景，蓝色标题，代码风格URL
  
- **文件大小优化**：
  - ✅ Markdown 格式更简洁，PDF 体积减小约 25%
  - ✅ 示例：opencode.ai 从 5.26MB → 3.96MB
  
- **技术实现**：
  - 新增依赖：`turndown`、`marked`
  - 修改文件：
    - `src/parser.js` - 添加 HTML → Markdown 转换
    - `src/crawler.js` - 内容格式标记为 'markdown'
    - `src/pdfGenerator.js` - Markdown → HTML 渲染 + 优化CSS
    - `src/pdfGeneratorLarge.js` - 同步支持 Markdown

- **兼容性**：
  - ✅ 保留图片尺寸信息（HTML 注释形式）
  - ✅ 保留代码块语言标记
  - ✅ 自动降级：Markdown 转换失败时使用原始 HTML

## [1.0.4] - 2026-02-11

### ✨ 功能增强

**优化正文图片展示 - 解决图片太小看不清的问题**

- **问题**：
  - 正文内容图片被限制为 24px，太小看不清
  - 所有段落中的图片都被当作小图标处理
  - 缺少对真实内容图片的识别和优化
  
- **优化**：
  - ✅ 内容图片最小宽度 300px，确保清晰可见
  - ✅ 独立图片段落（`<p><img></p>`）最小 400px，最大 90% 页面宽度
  - ✅ 智能识别图标：SVG、包含 icon/logo 关键字、小尺寸（16/20/24/32px）
  - ✅ 小图标限制为 28-40px，保持内联显示
  - ✅ 内容图片居中展示，自适应页面宽度（85-90%）
  
- **选择器优化**：
  - ✅ 新增 `[class*="sidebar"]` 模糊匹配选择器
  - ✅ 新增 `[class*="menu"]` 和 `[class*="nav"]` 选择器
  - ✅ 支持更多类型的侧边栏结构（如 volcengine）

- **文件**：
  - `src/pdfGenerator.js` - 重构图片 CSS 规则
  - `src/pdfGeneratorLarge.js` - 同步更新大文档生成器
  - `src/utils/config.js` - 增强导航选择器配置

## [1.0.3] - 2026-02-11

### 🐛 Bug 修复

**修复 PDF 中图片（图标）显示过大的问题**

- **问题**：
  - SVG 图标在 PDF 中显示过大，占满整行
  - 小图标失去原有比例，影响排版
  - 内联图标（在文本中的）破坏文本流
  
- **原因**：
  - 只有简单的 `max-width: 100%` 样式
  - 没有区分图标和内容图片
  - 缺少内联显示和垂直对齐处理
  
- **修复**：
  - ✅ SVG 图标限制为 32x32px，内联显示
  - ✅ 带尺寸属性的小图标限制为 48x48px
  - ✅ 文本中的图标限制为 24x24px，垂直居中
  - ✅ 独立内容图片保持 100% 宽度
  - ✅ 所有图标保持宽高比，避免变形

### 📝 CSS 改进

**新增图片样式规则**：

```css
/* SVG 图标 - 32x32px */
img[src^="data:image/svg"] {
  max-width: 32px !important;
  max-height: 32px !important;
  display: inline-block;
  vertical-align: middle;
}

/* 小图标 - 48x48px */
img[width]:not([width*="%"]) {
  max-width: 48px !important;
  max-height: 48px !important;
}

/* 内联图标 - 24x24px */
p img, li img, td img, h1 img {
  max-width: 24px;
  max-height: 24px;
  vertical-align: middle;
}

/* 内容图片 - 保持原样 */
.page-content > img {
  max-width: 100%;
}
```

### 📊 修复效果

| 图片类型 | 修复前 | 修复后 |
|---------|-------|-------|
| SVG 图标 | ❌ 过大 | ✅ 32x32px |
| 小图标 | ❌ 变形 | ✅ 48x48px |
| 内联图标 | ❌ 破坏排版 | ✅ 24x24px |
| 内容图片 | ✅ 正常 | ✅ 保持 |

### 📚 新增文档

- `IMAGE_FIX.md` - 图片修复详细说明和使用指南

### ⚠️ 注意

**已生成的 PDF 需要重新生成才能应用此修复！**

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
node src/index.js <URL> -o output.pdf --concurrency 2
```

---

## [1.0.2] - 2026-02-11

### 🐛 Bug 修复

**修复大型文档 PDF 生成失败问题**

- **问题**：生成大型 PDF 时出现 "Protocol error" 和内存溢出错误
- **原因**：
  - Puppeteer 渲染大型 HTML（> 100MB）时内存不足
  - Node.js 默认堆内存限制不足以处理超大文档（400+ 页）
  - 单个 PDF 文件过大导致浏览器崩溃
  
- **修复**：
  - ✅ 增加 Puppeteer 启动参数，优化内存使用
  - ✅ 增加页面加载和 PDF 生成超时（2-5 分钟）
  - ✅ 添加 HTML 大小检测和警告
  - ✅ 实现智能分批生成（超过 100MB 自动分批）
  - ✅ 更新 run.sh 自动设置 4GB 内存限制

### 📝 改进

**内存优化**：
- 浏览器参数：`--disable-dev-shm-usage`, `--disable-gpu`, `--single-process`
- 加载策略：从 `networkidle2` 改为 `domcontentloaded`
- 超时配置：加载 2 分钟，PDF 生成 5 分钟

**分批生成**：
- 自动检测：预估 HTML 超过 100MB 时触发
- 批次大小：每批 50 页
- 输出格式：`output_part1.pdf`, `output_part2.pdf`, ...
- 合并提示：自动提示在线 PDF 合并工具

### 📚 新增文档

- `SOLUTION_LARGE_DOCS.md` - 大型文档处理指南
- 包含 5 种解决方案和快速参考表

### 💡 使用建议

| 文档大小 | 推荐方法 |
|---------|---------|
| < 50 页 | 直接运行 |
| 50-200 页 | 默认设置 |
| 200-500 页 | 增加内存：`--max-old-space-size=8192` |
| > 500 页 | 分段爬取或使用自动分批功能 |

---

## [1.0.1] - 2026-02-11

### 🐛 Bug 修复

**修复侧边栏链接抓取不完整的问题**

- **问题**：某些网站（如 opencode.ai）只抓取到 1 个页面，而不是全部文档
- **原因**：之前的逻辑在找到第一个匹配的选择器后就停止，导致只获取部分链接
- **修复**：现在会尝试所有选择器，选择匹配链接数最多的结果

**修复前**：
```bash
node src/index.js https://opencode.ai/docs
# 结果: 发现 1 个文档链接，生成 279KB PDF
```

**修复后**：
```bash
node src/index.js https://opencode.ai/docs
# 结果: 发现 35 个文档链接，生成 6.0MB PDF ✅
```

### 📝 代码变更

修改文件：`src/parser.js`

```javascript
// 旧逻辑：找到第一个有链接的选择器就停止
for (const selector of navSelectors) {
  // ... 提取链接 ...
  if (links.size > 0) {
    break;  // ❌ 问题：可能丢失其他链接
  }
}

// 新逻辑：尝试所有选择器，选择链接最多的
for (const selector of navSelectors) {
  // ... 提取链接 ...
  if (currentLinks.size > maxCount) {
    maxCount = currentLinks.size;
    bestLinks = currentLinks;  // ✅ 保留最佳结果
  }
}
```

### ✅ 测试结果

| 网站 | 修复前 | 修复后 |
|------|--------|--------|
| opencode.ai/docs | 1 页 (279KB) | 34 页 (6.0MB) ✅ |
| example.com | 1 页 (52KB) | 1 页 (52KB) ✅ |
| docs.github.com/en/copilot | 测试中 | 288 页 ✅ |

### 🎯 受益场景

此修复特别改善了以下类型网站的抓取：
- 使用嵌套导航结构的网站
- 使用多个 `nav` 元素的网站
- 侧边栏导航不在第一个选择器的网站

---

## [1.0.0] - 2026-02-11

### 🎉 初始版本

- ✅ 智能爬虫：自动识别侧边栏导航
- ✅ 内容提取：去除无关元素
- ✅ PDF 生成：精美排版
- ✅ CLI 工具：友好的命令行界面
- ✅ 并发控制：可配置的并发数
- ✅ 错误处理：容错机制

### 🐛 已知问题修复

- ✅ chalk@5.x ESM 兼容性 → 降级到 chalk@4
- ✅ ora@9.x ESM 兼容性 → 降级到 ora@5
