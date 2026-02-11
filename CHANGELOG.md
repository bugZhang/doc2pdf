# 更新日志

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
