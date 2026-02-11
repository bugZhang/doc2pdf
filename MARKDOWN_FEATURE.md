# Markdown 转换功能说明

## 功能概述

**v1.0.5 引入了 Markdown 转换功能，将网页内容先转换为 Markdown 格式，再渲染为 PDF，实现更清晰、更统一的排版效果。**

## 转换流程

```
网页 HTML → 提取内容 → 清理 → Markdown → 渲染 HTML → 生成 PDF
  ↓           ↓           ↓         ↓           ↓           ↓
Puppeteer   Parser    cleanContent  Turndown    Marked   Puppeteer
```

### 详细步骤

1. **爬取网页** - Puppeteer 加载完整的 HTML
2. **提取内容** - 使用选择器提取主要内容区域
3. **清理元素** - 移除导航、页眉、页脚、广告等
4. **转为 Markdown** - Turndown 将 HTML 转换为 Markdown 文本
5. **渲染为 HTML** - Marked 将 Markdown 解析为格式良好的 HTML
6. **生成 PDF** - Puppeteer 将 HTML 渲染为 PDF

## 为什么使用 Markdown 中间格式？

### ✅ 优势

1. **统一格式**
   - 不同网站的 HTML 结构差异巨大
   - Markdown 提供统一的语义标记
   - 生成的 PDF 风格一致

2. **简化内容**
   - 自动去除冗余的 HTML 标签和样式
   - 保留核心语义（标题、列表、代码、链接）
   - 减少 PDF 文件大小（~25%）

3. **提升可读性**
   - 清晰的标题层级
   - 统一的代码块样式
   - 规范的表格和引用格式

4. **易于调试**
   - Markdown 纯文本，便于查看和编辑
   - 可以保存中间结果检查转换效果
   - 降级兼容：失败时使用原始 HTML

### ⚠️ 限制

1. **样式丢失**
   - 原网页的复杂样式无法完全保留
   - 只保留语义结构，不保留视觉装饰

2. **特殊元素**
   - 某些自定义 HTML 组件可能转换不准确
   - 需要确保 Turndown 规则覆盖关键元素

## 排版效果对比

### Before (v1.0.4) - 直接使用 HTML

```html
<div class="content">
  <h1 style="color: red; font-size: 32px;">标题</h1>
  <p class="intro lead">这是一段<span class="highlight">高亮</span>文字</p>
  <pre><code class="language-javascript">console.log('hello')</code></pre>
</div>
```

- ❌ 样式混乱（内联 CSS、类名冲突）
- ❌ 需要编写大量 CSS 覆盖规则
- ❌ 不同网站效果差异大

### After (v1.0.5) - 经过 Markdown 转换

```markdown
# 标题

这是一段**高亮**文字

\`\`\`javascript
console.log('hello')
\`\`\`
```

渲染为统一的 HTML：

```html
<h1>标题</h1>
<p>这是一段<strong>高亮</strong>文字</p>
<pre><code class="language-javascript">console.log('hello')</code></pre>
```

- ✅ 结构清晰，无冗余标签
- ✅ 统一的 GitHub 风格样式
- ✅ 代码块语言标记保留

## Turndown 配置

### 转换选项

```javascript
{
  headingStyle: 'atx',           // 使用 # 标题语法
  codeBlockStyle: 'fenced',      // 使用 ``` 代码块
  bulletListMarker: '-',         // 使用 - 作为列表标记
  emDelimiter: '_',              // 使用 _ 表示斜体
  strongDelimiter: '**'          // 使用 ** 表示粗体
}
```

### 自定义规则

#### 1. 图片转换规则

保留尺寸信息作为 HTML 注释：

```javascript
filter: 'img',
replacement: (content, node) => {
  const alt = node.getAttribute('alt') || '';
  const src = node.getAttribute('src') || '';
  const width = node.getAttribute('width') || '';
  const height = node.getAttribute('height') || '';
  
  let sizeInfo = '';
  if (width || height) {
    sizeInfo = ` <!-- size: ${width}x${height} -->`;
  }
  
  return `![${alt}](${src})${sizeInfo}`;
}
```

输出：
```markdown
![Logo](logo.png) <!-- size: 32x32 -->
```

#### 2. 代码块语言标记

保留语法高亮信息：

```javascript
filter: (node) => node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE',
replacement: (content, node) => {
  const codeNode = node.firstChild;
  const language = codeNode.getAttribute('class')?.replace(/^language-/, '') || '';
  const code = codeNode.textContent;
  return '\n```' + language + '\n' + code + '\n```\n';
}
```

## Marked 配置

### 渲染选项

```javascript
{
  gfm: true,              // 启用 GitHub Flavored Markdown
  breaks: true,           // 支持单行换行
  headerIds: true,        // 为标题生成 ID
  mangle: false,          // 不混淆邮箱地址
  smartLists: true,       // 智能列表识别
  smartypants: false      // 不转换引号为智能引号
}
```

### 支持的 GFM 扩展

- ✅ 表格（Tables）
- ✅ 任务列表（Task Lists）
- ✅ 删除线（Strikethrough）
- ✅ 自动链接（Autolinks）
- ✅ 围栏代码块（Fenced Code Blocks）

## CSS 样式优化

### GitHub 风格设计

#### 标题

```css
.markdown-body h1 {
  font-size: 28px;
  border-bottom: 2px solid #eaecef;
  padding-bottom: 10px;
  margin-bottom: 20px;
  color: #24292e;
}

.markdown-body h2 {
  font-size: 24px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 8px;
  margin-top: 32px;
}
```

#### 代码块

```css
.markdown-body pre {
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 18px;
  font-size: 13px;
}

.markdown-body code {
  background-color: rgba(175, 184, 193, 0.2);
  padding: 3px 6px;
  border-radius: 3px;
  font-family: "SF Mono", Monaco, Consolas, monospace;
}
```

#### 引用块

```css
.markdown-body blockquote {
  border-left: 4px solid #0366d6;
  padding: 12px 20px;
  margin: 20px 0;
  background: #f6f8fa;
  color: #57606a;
  font-style: italic;
  border-radius: 0 6px 6px 0;
}
```

#### 表格

```css
.markdown-body table {
  border: 1px solid #d0d7de;
  border-collapse: collapse;
}

.markdown-body th {
  background-color: #f6f8fa;
  font-weight: 600;
  padding: 10px 13px;
}

.markdown-body tr:nth-child(2n) {
  background-color: #f6f8fa;
}
```

## 使用示例

### 基本使用

```bash
# 自动使用 Markdown 转换
./run.sh https://docs.example.com ./output/docs.pdf
```

### 查看中间结果

临时 HTML 文件会自动保存在输出目录：

```bash
# 生成 PDF
./run.sh https://docs.example.com ./output/docs.pdf

# 查看渲染前的 HTML（包含 Markdown 转换后的内容）
open ./output/docs_temp.html
```

### 调试 Markdown 转换

如果想查看 Markdown 中间结果，可以修改 `crawler.js`：

```javascript
// 在 crawlPage 方法中添加
const markdown = this.parser.convertToMarkdown(content);
console.log('Markdown:', markdown); // 打印 Markdown
```

## 性能影响

### 转换耗时

| 步骤 | 耗时 | 说明 |
|------|------|------|
| HTML → Markdown | ~5ms/page | Turndown 转换速度快 |
| Markdown → HTML | ~3ms/page | Marked 解析高效 |
| 总增加耗时 | ~8ms/page | 可忽略不计 |

### 文件大小变化

| 项目 | Before | After | 减少 |
|------|--------|-------|------|
| HTML 体积 | 0.93 MB | 0.35 MB | 62% |
| PDF 体积 | 5.26 MB | 3.96 MB | 25% |

## 故障处理

### Markdown 转换失败

```javascript
try {
  const markdown = this.turndownService.turndown(html);
  return markdown;
} catch (error) {
  console.warn('Markdown 转换失败，使用原始 HTML:', error.message);
  return html;  // 降级到原始 HTML
}
```

### Markdown 渲染失败

```javascript
try {
  return marked.parse(markdown);
} catch (error) {
  logger.warning('Markdown 解析失败，使用原始内容');
  return markdown;  // 返回 Markdown 文本
}
```

## 相关文件

- `src/parser.js` - HTML → Markdown 转换逻辑
- `src/crawler.js` - 添加 `format: 'markdown'` 标记
- `src/pdfGenerator.js` - Markdown → HTML 渲染 + CSS 样式
- `src/pdfGeneratorLarge.js` - 大文档生成器同步支持
- `package.json` - 新增依赖：turndown, marked

## 未来改进

- [ ] 支持 Markdown 直接导出（`.md` 文件）
- [ ] 自定义 Markdown 渲染主题
- [ ] 支持更多 GFM 扩展（脚注、定义列表）
- [ ] Markdown 插件系统（数学公式、流程图）
- [ ] 语法高亮渲染（集成 highlight.js）

## 版本历史

- **v1.0.2-1.0.4** - 直接使用 HTML 生成 PDF
- **v1.0.5** - 引入 Markdown 转换，统一排版风格 ✅
