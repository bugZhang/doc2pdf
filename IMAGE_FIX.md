# 图片大小修复说明

## 🐛 问题

PDF 中的图片（尤其是小图标）显示过大，影响排版：
- ✗ SVG 图标变得很大
- ✗ 内联图标（在文本中的）占用过多空间
- ✗ Logo 和 icon 失去原有比例

## ✅ 解决方案

已优化图片 CSS 样式，区分不同类型的图片：

### 1. **小图标限制**（带 width/height 属性的）

```css
/* 限制最大 48x48px */
img[width]:not([width*="%"]) {
  max-width: 48px !important;
  max-height: 48px !important;
}
```

### 2. **SVG 图标优化**

```css
/* data:image/svg 开头的，限制 32x32px */
img[src^="data:image/svg"] {
  max-width: 32px !important;
  max-height: 32px !important;
  display: inline-block;
  vertical-align: middle;
}
```

### 3. **内联图标**（在文本、列表、表格中的）

```css
/* 在 p, li, td, h1-h6 中的图片，限制 24x24px */
p img, li img, td img, h1 img {
  max-width: 24px;
  max-height: 24px;
  display: inline-block;
  vertical-align: middle;
}
```

### 4. **独立大图片**（单独一行的）

```css
/* 保持原样，最大宽度 100% */
.page-content > img,
.page-content > p > img:only-child {
  display: block;
  max-width: 100%;
  margin: 16px auto;
}
```

## 📊 修复效果

| 图片类型 | 修复前 | 修复后 |
|---------|-------|-------|
| SVG 图标 | ❌ 过大，占满行 | ✅ 32x32px，内联显示 |
| 小图标 | ❌ 拉伸变形 | ✅ 48x48px，保持比例 |
| 内联图标 | ❌ 破坏文本流 | ✅ 24x24px，垂直居中 |
| 内容图片 | ✅ 正常 | ✅ 保持原样 |

## 🔧 已修改文件

- ✅ `src/pdfGenerator.js` - 标准生成器
- ✅ `src/pdfGeneratorLarge.js` - 大文档生成器

## 🚀 使用方法

### 重新生成 PDF

```bash
# 使用修复后的版本重新生成
export NODE_OPTIONS="--max-old-space-size=8192"
node src/index.js <你的 URL> -o output.pdf --concurrency 2
```

### 针对 volcengine 文档

你的 volcengine 文档需要重新生成才能应用修复：

```bash
# 删除旧的 PDF（可选）
rm volcengine_part*.pdf

# 重新生成
export NODE_OPTIONS="--max-old-space-size=8192"
node src/index.js <volcengine URL> -o volcengine-fixed.pdf --concurrency 2
```

## 💡 CSS 样式优先级

1. **内联图标**（最小）：24x24px
   - 在文本、列表、标题中
   
2. **SVG 图标**（小）：32x32px
   - data:image/svg 开头的
   
3. **一般小图标**（中）：48x48px
   - 带 width/height 属性的
   
4. **内容图片**（大）：max-width 100%
   - 独立显示的图片

## 📝 技术细节

### 垂直对齐

```css
vertical-align: middle;
```
确保图标与文字垂直居中对齐。

### 响应式保持

```css
width: auto !important;
height: auto !important;
```
保持图片原始宽高比，避免拉伸变形。

### 内联显示

```css
display: inline-block;
margin: 0 4px;
```
让图标可以在文本中内联显示，左右留 4px 间距。

## ⚠️ 注意事项

1. **已生成的 PDF 需要重新生成**才能应用修复
2. 如果某些图标仍然太大，可以进一步调小限制值
3. 如果需要自定义，可以修改 `src/pdfGenerator.js` 中的 CSS

## 🎯 自定义图标大小

如果默认大小不合适，可以修改：

```javascript
// src/pdfGenerator.js 第 284-290 行附近

/* SVG 图标优化 */
img[src^="data:image/svg"] {
  max-width: 24px !important;  // 改为你想要的大小
  max-height: 24px !important;
  // ...
}
```

---

**总结**: 图片大小问题已修复！重新生成 PDF 即可看到效果。
