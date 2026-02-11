const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');

class PDFGenerator {
  constructor(config) {
    this.config = config;
  }

  async generate(pages, outputPath) {
    logger.info('开始生成 PDF...');

    // 创建 HTML 内容
    const html = this.createHTML(pages);
    
    // 保存临时 HTML 文件（用于调试）
    const tempHTMLPath = outputPath.replace('.pdf', '_temp.html');
    await fs.writeFile(tempHTMLPath, html, 'utf-8');
    const htmlSizeMB = (html.length / 1024 / 1024).toFixed(2);
    logger.info(`临时 HTML 已保存: ${tempHTMLPath} (${htmlSizeMB} MB)`);

    // 如果 HTML 太大，警告用户
    if (html.length > 50 * 1024 * 1024) { // 50MB
      logger.warning(`HTML 文件较大 (${htmlSizeMB} MB)，PDF 生成可能需要较长时间...`);
    }

    // 生成 PDF - 增加内存和超时配置
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process', // 单进程模式，减少内存占用
        '--max-old-space-size=4096' // 增加 Node.js 内存限制
      ]
    });

    try {
      const page = await browser.newPage();
      
      // 设置页面超时和内存限制
      page.setDefaultNavigationTimeout(120000); // 2分钟超时
      page.setDefaultTimeout(120000);
      
      logger.info('正在加载 HTML 内容...');
      
      // 使用更宽松的等待条件
      await page.setContent(html, { 
        waitUntil: 'domcontentloaded', // 改为 domcontentloaded，不等待所有资源
        timeout: 120000 
      });

      logger.info('正在渲染 PDF...');

      // 确保输出目录存在
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      await page.pdf({
        path: outputPath,
        ...this.config.pdfOptions,
        timeout: 180000 // 3分钟 PDF 生成超时
      });

      logger.success(`PDF 已生成: ${outputPath}`);
      
      // 清理临时文件
      try {
        await fs.unlink(tempHTMLPath);
      } catch (e) {
        // 忽略删除失败
      }

      // 获取文件大小
      const stats = await fs.stat(outputPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      logger.info(`文件大小: ${sizeMB} MB`);

      return outputPath;
    } finally {
      await browser.close();
    }
  }

  createHTML(pages) {
    const pageHTMLs = pages.map((page, index) => {
      return `
        <div class="page-container">
          <div class="page-header">
            <h1>${this.escapeHtml(page.title)}</h1>
            <p class="page-url">${this.escapeHtml(page.url)}</p>
          </div>
          <div class="page-content">
            ${page.content}
          </div>
          ${index < pages.length - 1 ? '<div class="page-break"></div>' : ''}
        </div>
      `;
    }).join('\n');

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }

    .page-container {
      padding: 20px;
    }

    .page-header {
      border-bottom: 2px solid #e1e4e8;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .page-url {
      font-size: 12px;
      color: #666;
      font-family: monospace;
    }

    .page-content {
      font-size: 14px;
    }

    .page-break {
      page-break-after: always;
      margin: 40px 0;
      border-top: 2px dashed #ccc;
      padding-top: 20px;
    }

    /* 标题样式 */
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 24px; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
    h2 { font-size: 20px; border-bottom: 1px solid #eaecef; padding-bottom: 6px; }
    h3 { font-size: 18px; }
    h4 { font-size: 16px; }
    h5 { font-size: 14px; }
    h6 { font-size: 14px; color: #666; }

    /* 段落和文本 */
    p {
      margin-bottom: 16px;
    }

    /* 列表 */
    ul, ol {
      margin-bottom: 16px;
      padding-left: 32px;
    }

    li {
      margin-bottom: 4px;
    }

    /* 代码块 */
    code {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 2px 6px;
      font-family: "SF Mono", Monaco, "Courier New", monospace;
      font-size: 85%;
      color: #e83e8c;
    }

    pre {
      background-color: #f6f8fa;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 16px;
      line-height: 1.45;
    }

    pre code {
      background-color: transparent;
      padding: 0;
      color: #333;
      font-size: 12px;
    }

    /* 表格 */
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 16px;
      font-size: 13px;
    }

    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: #fafbfc;
    }

    /* 链接 */
    a {
      color: #0366d6;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* 引用 */
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 16px;
      margin-bottom: 16px;
      color: #666;
    }

    /* 图片 */
    img {
      max-width: 100%;
      height: auto;
      margin: 16px 0;
    }

    /* 水平线 */
    hr {
      border: none;
      border-top: 2px solid #e1e4e8;
      margin: 24px 0;
    }

    /* 打印优化 */
    @media print {
      body {
        font-size: 12pt;
      }
      
      .page-break {
        page-break-after: always;
        border: none;
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  ${pageHTMLs}
</body>
</html>
    `;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = PDFGenerator;
