# 大型文档 PDF 生成失败的解决方案

## 问题

生成 PDF 时出现错误：
```
Protocol error (Runtime.callFunctionOn): Target closed
FATAL ERROR: JavaScript heap out of memory
```

## 原因

- **HTML 文件太大**：158MB，435 个页面
- **Puppeteer 内存不足**：渲染大型 HTML 导致浏览器崩溃
- **Node.js 内存限制**：默认堆内存不足以处理超大文档

## 解决方案

### 方案 1：增加 Node.js 内存限制（推荐）

```bash
# 设置 8GB 内存限制
export NODE_OPTIONS="--max-old-space-size=8192"

# 重新生成 PDF
node src/index.js <URL> -o output.pdf
```

或直接运行：
```bash
node --max-old-space-size=8192 src/index.js <URL> -o output.pdf
```

### 方案 2：减少并发数，重新爬取

```bash
# 使用单线程爬取，减少内存占用
node src/index.js <URL> --concurrency 1 -o output.pdf
```

### 方案 3：分批生成 PDF

工具已内置分批生成功能。对于超过 100MB 的 HTML，会自动：
1. 将页面分成每批 50 页
2. 分别生成多个 PDF 文件
3. 提示用户使用在线工具合并

```bash
# 会自动检测并分批生成
node --max-old-space-size=8192 src/index.js <URL> -o output.pdf
```

### 方案 4：只爬取特定页面

如果只需要部分文档：
```bash
# 使用更具体的 URL
node src/index.js https://site.com/docs/specific-section -o output.pdf

# 使用自定义选择器只抓取特定链接
node src/index.js <URL> -s ".specific-nav a" -o output.pdf
```

### 方案 5：使用在线 PDF 合并工具

如果已生成多个分片：
1. **iLovePDF**: https://www.ilovepdf.com/merge_pdf
2. **Smallpdf**: https://smallpdf.com/merge-pdf
3. **PDF Candy**: https://pdfcandy.com/merge-pdf

## 针对 volcengine 文档的建议

你的文档有 **435 页**，建议：

### 立即可用的方案：

```bash
# 增加内存后重新爬取
export NODE_OPTIONS="--max-old-space-size=8192"
node src/index.js https://volcengine.com/docs <完整URL> -o volcengine.pdf --concurrency 2
```

### 如果仍然失败：

分段爬取文档的不同部分：
```bash
# 第 1 部分：入门
node src/index.js https://volcengine.com/docs/getting-started -o volcengine-part1.pdf

# 第 2 部分：API 参考
node src/index.js https://volcengine.com/docs/api -o volcengine-part2.pdf

# ... 其他部分
```

然后使用在线工具合并。

## 改进建议

下一个版本将添加：
1. ✅ 自动内存检测和优化
2. ✅ 分批 PDF 生成（已实现）
3. ⏳ PDF 分片自动合并
4. ⏳ 流式 HTML 处理
5. ⏳ 可配置的最大文档大小

## 快速参考

| 页面数 | 预估大小 | 推荐内存 | 命令 |
|--------|---------|----------|------|
| < 50 | < 20MB | 默认 | 直接运行 |
| 50-200 | 20-80MB | 2GB | `--max-old-space-size=2048` |
| 200-500 | 80-200MB | 8GB | `--max-old-space-size=8192` |
| > 500 | > 200MB | 分批生成 | 自动分批或分段爬取 |

---

**总结**：对于你的 435 页文档，使用 `export NODE_OPTIONS="--max-old-space-size=8192"` 然后重新运行即可。
