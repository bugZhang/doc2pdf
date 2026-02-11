# 测试文档

## 如何测试

### 1. 测试命令行界面

```bash
# 显示帮助信息
node src/index.js --help

# 显示版本
node src/index.js --version
```

### 2. 测试小型文档站点

```bash
# VuePress 文档示例
node src/index.js https://vuepress.vuejs.org/guide/ -o ./output/vuepress.pdf

# Puppeteer 文档示例  
node src/index.js https://pptr.dev/ -o ./output/puppeteer.pdf
```

### 3. 自定义选择器测试

```bash
# 如果默认选择器无法识别导航，使用自定义选择器
node src/index.js <url> -s ".custom-sidebar a" -c ".custom-content"
```

### 4. 并发测试

```bash
# 增加并发数以加快速度
node src/index.js <url> --concurrency 5
```

## 预期行为

1. 程序启动后会显示蓝色的信息图标 ℹ
2. 成功时会显示绿色的勾号 ✓
3. 错误时会显示红色的叉号 ✗
4. 进度会使用 ora 动画显示

## 常见问题

### 问题：找不到导航链接

**解决方案**：
1. 使用浏览器开发者工具检查网站的导航 DOM 结构
2. 找到包含导航链接的选择器
3. 使用 `-s` 参数指定：`-s ".your-nav-selector a"`

### 问题：内容不完整

**解决方案**：
1. 检查网站的主内容区域选择器
2. 使用 `-c` 参数指定：`-c ".your-content-selector"`

### 问题：页面加载超时

**解决方案**：
1. 增加超时时间：`-t 60000`（60秒）
2. 检查网络连接
3. 尝试减少并发数：`--concurrency 1`

## 调试技巧

1. **使用详细模式**：添加 `-v` 参数查看详细日志
2. **检查临时 HTML**：PDF 生成前会保存临时 HTML 文件，可以在浏览器中打开检查
3. **单页测试**：先测试单个页面，确认选择器正确后再爬取整个站点

## 测试清单

- [ ] 帮助命令正常工作
- [ ] 版本命令正常工作
- [ ] 可以成功爬取至少一个文档站点
- [ ] PDF 文件正常生成
- [ ] PDF 内容格式正确
- [ ] 页面分隔显示正确
- [ ] 错误处理正常工作
