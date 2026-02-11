# 🚀 快速开始

## 安装

```bash
cd /Users/jerry/Documents/node-workspace/doc2pdf
npm install
```

## 使用

### 方式 1: 直接运行

```bash
node src/index.js https://docs.example.com
```

### 方式 2: 使用快捷脚本

```bash
./run.sh https://docs.example.com
```

### 方式 3: 使用 npm

```bash
npm start -- https://docs.example.com -o ./my-docs.pdf
```

## 常用命令

```bash
# 查看帮助
node src/index.js --help

# 指定输出路径
node src/index.js https://docs.example.com -o ./output/my-docs.pdf

# 使用自定义选择器
node src/index.js https://docs.example.com -s ".sidebar a" -c "main"

# 增加并发数
node src/index.js https://docs.example.com --concurrency 5

# 详细模式
node src/index.js https://docs.example.com -v
```

## 测试建议

建议先测试一些知名的文档站点：

```bash
# Puppeteer 文档（英文）
node src/index.js https://pptr.dev/ -o ./output/puppeteer.pdf

# MDN Web Docs（可能需要自定义选择器）
node src/index.js https://developer.mozilla.org/zh-CN/docs/Web/JavaScript -o ./output/mdn.pdf
```

## 配置文件

复制示例配置文件：

```bash
cp doc2pdf.config.example.js doc2pdf.config.js
```

然后编辑 `doc2pdf.config.js` 进行自定义配置。

## 输出

- PDF 文件会保存到指定路径（默认 `./output/docs.pdf`）
- 会生成临时 HTML 文件用于调试（`*_temp.html`）

## 注意

⚠️ **首次运行需要下载 Chromium（约 300MB），请耐心等待！**

## 文档

- 详细使用说明：查看 [README.md](README.md)
- 测试指南：查看 [TESTING.md](TESTING.md)
- 项目总结：查看 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## 问题？

遇到问题请先查看 [TESTING.md](TESTING.md) 的故障排除部分。

---

祝使用愉快！🎉
