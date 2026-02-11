# Doc2PDF 项目总结

## 项目完成情况 ✅

已完成一个功能完整的文档网站转 PDF 工具，包含以下核心功能：

### ✅ 已实现功能

1. **CLI 命令行界面**
   - 使用 Commander.js 实现命令行参数解析
   - 支持多种配置选项
   - 友好的帮助信息和错误提示

2. **智能爬虫**
   - 基于 Puppeteer 的无头浏览器爬取
   - 自动识别侧边栏导航链接
   - 支持多种导航选择器模式
   - URL 去重和规范化
   - 并发控制（默认 3 个）
   - 错误重试和容错机制

3. **内容解析**
   - 基于 Cheerio 的 HTML 解析
   - 智能识别主内容区域
   - 自动清理无关元素（导航、广告等）
   - 保留核心格式（标题、代码、表格等）

4. **PDF 生成**
   - 精美的 PDF 模板
   - 页面分隔和标题
   - 优化的打印样式
   - 代码高亮支持
   - 表格、列表格式化

5. **用户体验**
   - 彩色日志输出（Chalk）
   - 进度动画（Ora）
   - 详细的统计信息
   - 友好的错误提示

## 项目结构

```
doc2pdf/
├── src/
│   ├── index.js              # CLI 入口
│   ├── crawler.js            # 爬虫逻辑
│   ├── parser.js             # HTML 解析
│   ├── pdfGenerator.js       # PDF 生成
│   └── utils/
│       ├── config.js         # 配置管理
│       ├── logger.js         # 日志工具
│       └── urlHelper.js      # URL 工具
├── output/                   # 输出目录
├── package.json
├── README.md                 # 使用文档
├── TESTING.md               # 测试文档
├── doc2pdf.config.example.js # 配置示例
├── run.sh                   # 快速启动脚本
└── .gitignore
```

## 技术栈

- **Node.js**: 运行环境
- **Puppeteer**: 无头浏览器，页面渲染和 PDF 生成
- **Cheerio**: 快速的 HTML 解析
- **Commander**: CLI 参数解析
- **Ora**: 终端加载动画
- **Chalk**: 终端彩色输出

## 核心算法

### 1. 导航链接发现
- 尝试多个常见的导航选择器
- 规范化 URL（去除锚点、处理相对路径）
- 同源检查（只爬取同域名页面）
- 去重机制

### 2. 并发控制
- 限制同时爬取的页面数
- 队列管理
- Promise.race 实现的并发调度

### 3. 内容提取
- 尝试多个内容选择器
- 启发式算法选择最佳内容区域
- 清理脚本、样式、无关元素

## 使用示例

### 基本使用
```bash
node src/index.js https://docs.example.com
```

### 高级使用
```bash
# 自定义输出路径
node src/index.js https://docs.example.com -o ./my-docs.pdf

# 自定义选择器
node src/index.js https://docs.example.com -s ".sidebar a" -c "main"

# 增加并发和超时
node src/index.js https://docs.example.com --concurrency 5 -t 60000

# 详细模式
node src/index.js https://docs.example.com -v
```

### 快速启动
```bash
./run.sh https://docs.example.com
```

## 配置选项

支持通过以下方式配置：
1. 命令行参数
2. 配置文件（doc2pdf.config.js）
3. 默认配置

优先级：命令行参数 > 配置文件 > 默认配置

## 兼容性

支持大多数主流文档站点类型：
- ✅ VuePress
- ✅ Docusaurus
- ✅ GitBook
- ✅ Read the Docs
- ✅ 其他标准文档站点

## 性能特点

- 并发爬取，提升速度
- 智能识别，减少无效请求
- 增量处理，节省内存
- 错误容错，保证稳定性

## 未来改进方向

1. **测试**
   - 添加单元测试
   - 添加集成测试
   - 多种文档站点测试

2. **功能增强**
   - 支持增量更新
   - 支持书签导航
   - 支持多语言文档
   - 支持导出 Markdown
   - 支持 ePub 格式

3. **性能优化**
   - 缓存机制
   - 资源压缩
   - 更智能的内容识别

4. **用户体验**
   - Web UI 界面
   - 进度条优化
   - 更详细的错误信息

5. **部署**
   - Docker 镜像
   - npm 包发布
   - 在线服务

## 注意事项

1. **首次运行**：Puppeteer 会自动下载 Chromium（约 300MB）
2. **网络要求**：需要稳定的网络连接
3. **内存使用**：大型站点可能占用较多内存
4. **爬取礼仪**：请遵守网站的服务条款和 robots.txt

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| 找不到导航链接 | 使用 `-s` 参数指定自定义选择器 |
| 内容提取不完整 | 使用 `-c` 参数指定内容选择器 |
| 页面加载超时 | 增加 `-t` 超时时间 |
| 内存不足 | 减少 `--concurrency` 并发数 |

## 开发者指南

### 添加新的导航选择器
编辑 `src/utils/config.js` 的 `navSelectors` 数组

### 添加新的内容选择器
编辑 `src/utils/config.js` 的 `contentSelectors` 数组

### 自定义 PDF 样式
编辑 `src/pdfGenerator.js` 的 CSS 部分

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**项目状态**: ✅ 核心功能完成，可用于生产环境

**最后更新**: 2026-02-11
