# 图片展示优化说明

## 问题描述

**v1.0.3 及之前版本的问题：**
- 正文内容图片被过度限制（24px），看不清细节
- 没有区分小图标和内容图片
- 所有段落中的图片都被当作内联图标处理

## 优化策略

### 1. 图片分类识别

#### **内容图片**（Content Images）
识别条件（同时满足）：
- ✅ 没有 `width` 或 `height` 属性
- ✅ 不包含 `icon` 或 `logo` 关键字
- ✅ 不是 SVG data URI

展示规则：
```css
/* 普通内容图片 */
min-width: 300px;
max-width: 85%;
display: block;
margin: 20px auto;

/* 独立图片段落 (<p><img></p>) */
min-width: 400px;
max-width: 90%;
display: block;
margin: 24px auto;
```

#### **SVG 图标**
识别条件：
- `src` 以 `data:image/svg` 开头

展示规则：
```css
max-width: 32px;
max-height: 32px;
display: inline-block;
vertical-align: middle;
margin: 0 4px;
```

#### **小尺寸图标**
识别条件：
- 带有 `width="16"` / `width="20"` / `width="24"` / `width="32"` 属性
- 或带有相应的 `height` 属性

展示规则：
```css
max-width: 32px;
max-height: 32px;
display: inline-block;
vertical-align: middle;
margin: 0 4px;
```

#### **命名图标**
识别条件：
- `src` 包含 `icon` 或 `logo`
- `class` 包含 `icon` 或 `logo`

展示规则：
```css
max-width: 40px;
max-height: 40px;
display: inline-block;
vertical-align: middle;
margin: 0 6px;
```

#### **标题和列表中的图标**
识别条件：
- 在 `h1-h6` 或 `li` 中的带 `width` 属性的图片

展示规则：
```css
max-width: 28px;
max-height: 28px;
display: inline-block;
vertical-align: middle;
margin: 0 4px;
```

### 2. CSS 优先级设计

从高到低：
1. **标题/列表图标** - 最严格限制（28px）
2. **命名图标** - icon/logo 关键字（40px）
3. **小尺寸图标** - 明确的小尺寸属性（32px）
4. **SVG 图标** - SVG data URI（32px）
5. **独立图片段落** - 单独一行的大图（400-90%）
6. **内容图片** - 正文图片（300-85%）
7. **基础样式** - 默认块级居中

使用 `!important` 确保小图标规则不被覆盖。

### 3. 关键改进

#### **Before (v1.0.3):**
```css
/* 所有段落中的图片都被限制 */
p img {
  max-width: 24px;
  max-height: 24px;
}
```
❌ 导致正文大图也只有 24px

#### **After (v1.0.4):**
```css
/* 智能识别内容图片 */
img:not([width]):not([height]):not([src*="icon"]):not([src*="logo"]):not([src^="data:image/svg"]) {
  min-width: 300px;
  max-width: 85%;
}

/* 独立图片更大展示 */
p > img:only-child {
  min-width: 400px !important;
  max-width: 90% !important;
}
```
✅ 内容图片合理展示，小图标仍受限制

## 效果对比

| 图片类型 | v1.0.3 | v1.0.4 | 说明 |
|---------|--------|--------|------|
| 正文截图 | 24px | 300-85% | ✅ 清晰可见 |
| 架构图 | 24px | 400-90% | ✅ 细节清晰 |
| SVG 图标 | 32px | 32px | ✅ 保持合适 |
| 小图标 | 48px | 32-40px | ✅ 略微优化 |
| 列表图标 | 24px | 28px | ✅ 保持内联 |

## 使用建议

### 对于文档作者：
1. **内容图片**：不要添加 `width`/`height` 属性，让工具自动识别
2. **小图标**：添加 `width="20"` 等属性，或在文件名中包含 `icon`
3. **独立图片**：放在单独的段落中（`<p><img></p>`）以获得最大展示

### 对于开发者：
- 修改规则：编辑 `src/pdfGenerator.js` 和 `src/pdfGeneratorLarge.js` 中的图片 CSS
- 调整尺寸：修改 `min-width`、`max-width` 值
- 添加类型：增加新的识别条件和对应样式

## 已知限制

1. **最小宽度限制**：如果页面宽度小于 400px，图片会被压缩
2. **识别准确度**：依赖 HTML 属性和文件名，可能有误判
3. **响应式限制**：PDF 是静态的，不支持响应式缩放

## 相关文件

- `src/pdfGenerator.js` - 标准 PDF 生成器的图片样式
- `src/pdfGeneratorLarge.js` - 大文档 PDF 生成器的图片样式（紧凑版）
- `IMAGE_FIX.md` - v1.0.3 图标过大问题的修复说明
- `CHANGELOG.md` - 版本更新日志

## 版本历史

- **v1.0.2** - 基础图片样式
- **v1.0.3** - 修复图标过大，引入小图标识别
- **v1.0.4** - 修复内容图片过小，智能区分图标和内容图片 ✅
