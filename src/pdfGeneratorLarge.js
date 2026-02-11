const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const logger = require('./utils/logger');

class PDFGeneratorLarge {
  constructor(config) {
    this.config = config;
    
    // 配置 marked 选项
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
      smartLists: true,
      smartypants: false
    });
  }

  markdownToHtml(markdown) {
    try {
      return marked.parse(markdown);
    } catch (error) {
      logger.warning('Markdown 解析失败，使用原始内容');
      return markdown;
    }
  }

  async generate(pages, outputPath) {
    const htmlSizeMB = this.estimateHTMLSize(pages);
    
    // 如果 HTML 预计超过 100MB，使用分块生成
    if (htmlSizeMB > 100) {
      logger.warning(`文档较大 (预计 ${htmlSizeMB.toFixed(0)} MB)，将分批生成 PDF...`);
      return await this.generateInChunks(pages, outputPath);
    } else {
      return await this.generateDirect(pages, outputPath);
    }
  }

  estimateHTMLSize(pages) {
    // 粗略估计：每个页面平均 300KB
    const avgSizePerPage = 300 * 1024;
    return (pages.length * avgSizePerPage) / (1024 * 1024);
  }

  async generateDirect(pages, outputPath) {
    logger.info('开始生成 PDF...');
    
    const html = this.createHTML(pages);
    const htmlSizeMB = (Buffer.byteLength(html, 'utf-8') / 1024 / 1024).toFixed(2);
    
    const tempHTMLPath = outputPath.replace('.pdf', '_temp.html');
    await fs.writeFile(tempHTMLPath, html, 'utf-8');
    logger.info(`临时 HTML: ${tempHTMLPath} (${htmlSizeMB} MB)`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(180000);
      page.setDefaultTimeout(180000);
      
      logger.info('正在加载 HTML...');
      await page.setContent(html, { 
        waitUntil: 'domcontentloaded',
        timeout: 180000 
      });

      logger.info('正在渲染 PDF...');
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      await page.pdf({
        path: outputPath,
        ...this.config.pdfOptions,
        timeout: 300000 // 5分钟
      });

      logger.success(`PDF 已生成: ${outputPath}`);
      
      try {
        await fs.unlink(tempHTMLPath);
      } catch (e) {}

      const stats = await fs.stat(outputPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      logger.info(`文件大小: ${sizeMB} MB`);

      return outputPath;
    } finally {
      await browser.close();
    }
  }

  async generateInChunks(pages, outputPath) {
    const chunkSize = 50; // 每批 50 页
    const chunks = [];
    
    for (let i = 0; i < pages.length; i += chunkSize) {
      chunks.push(pages.slice(i, i + chunkSize));
    }
    
    logger.info(`将分 ${chunks.length} 批生成 PDF（每批 ${chunkSize} 页）`);
    
    const pdfPaths = [];
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
      for (let i = 0; i < chunks.length; i++) {
        logger.info(`正在生成第 ${i + 1}/${chunks.length} 批...`);
        
        const chunkPath = outputPath.replace('.pdf', `_part${i + 1}.pdf`);
        const html = this.createHTML(chunks[i]);
        
        const page = await browser.newPage();
        page.setDefaultTimeout(120000);
        
        await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 120000 });
        
        await page.pdf({
          path: chunkPath,
          ...this.config.pdfOptions,
          timeout: 180000
        });
        
        await page.close();
        pdfPaths.push(chunkPath);
        
        logger.success(`第 ${i + 1} 批完成`);
      }
    } finally {
      await browser.close();
    }

    logger.info('所有批次生成完成！');
    logger.warning(`由于文档较大，已生成 ${pdfPaths.length} 个 PDF 文件：`);
    pdfPaths.forEach((p, i) => {
      logger.info(`  第 ${i + 1} 部分: ${p}`);
    });
    logger.info(`\n提示：你可以使用 PDF 合并工具合并这些文件，或使用在线工具如：`);
    logger.info(`  - https://www.ilovepdf.com/merge_pdf`);
    logger.info(`  - https://smallpdf.com/merge-pdf`);

    return pdfPaths[0]; // 返回第一个文件路径
  }

  createHTML(pages) {
    const pageHTMLs = pages.map((page, index) => {
      // 如果内容是 Markdown 格式，先转换为 HTML
      let content = page.content;
      if (page.format === 'markdown') {
        content = this.markdownToHtml(content);
      }
      
      return `
        <div class="page-container">
          <div class="page-header">
            <h1 class="page-title">${this.escapeHtml(page.title)}</h1>
            <p class="page-url">${this.escapeHtml(page.url)}</p>
          </div>
          <div class="page-content markdown-body">
            ${content}
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .page-container { padding: 20px; }
    .page-header { border-bottom: 3px solid #0366d6; padding: 20px; margin-bottom: 32px; background: linear-gradient(to right, #f6f8fa, #ffffff); border-radius: 6px; }
    .page-header .page-title { font-size: 32px; margin-bottom: 8px; color: #0366d6; font-weight: 700; }
    .page-url { font-size: 11px; color: #586069; font-family: "SF Mono", Monaco, monospace; background: #f6f8fa; padding: 4px 8px; border-radius: 3px; display: inline-block; }
    .markdown-body { font-size: 15px; line-height: 1.7; }
    .page-break { page-break-after: always; margin: 60px 0; border-top: 3px solid #e1e4e8; padding-top: 30px; }
    .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { margin-top: 28px; margin-bottom: 18px; font-weight: 600; line-height: 1.25; color: #24292e; }
    .markdown-body h1:first-child, .markdown-body h2:first-child, .markdown-body h3:first-child { margin-top: 0; }
    .markdown-body h1 { font-size: 28px; border-bottom: 2px solid #eaecef; padding-bottom: 10px; margin-bottom: 20px; }
    .markdown-body h2 { font-size: 24px; border-bottom: 1px solid #eaecef; padding-bottom: 8px; margin-top: 32px; }
    .markdown-body h3 { font-size: 20px; margin-top: 24px; }
    .markdown-body h4 { font-size: 17px; }
    .markdown-body h5 { font-size: 15px; }
    .markdown-body h6 { font-size: 14px; color: #6a737d; }
    .markdown-body p { margin-bottom: 18px; line-height: 1.7; }
    .markdown-body ul, .markdown-body ol { margin-bottom: 18px; padding-left: 28px; }
    .markdown-body li { margin-bottom: 6px; line-height: 1.6; }
    .markdown-body li > p { margin-bottom: 8px; }
    .markdown-body ul ul, .markdown-body ol ol, .markdown-body ul ol, .markdown-body ol ul { margin-top: 6px; margin-bottom: 6px; }
    .markdown-body code { background-color: rgba(175, 184, 193, 0.2); border-radius: 3px; padding: 3px 6px; font-family: "SF Mono", Monaco, Consolas, monospace; font-size: 85%; color: #24292e; }
    .markdown-body pre { background-color: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 18px; overflow-x: auto; margin-bottom: 20px; line-height: 1.5; font-size: 13px; }
    .markdown-body pre code { background-color: transparent; padding: 0; color: #24292e; font-size: 13px; border-radius: 0; }
    .markdown-body table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 14px; border: 1px solid #d0d7de; }
    .markdown-body th, .markdown-body td { border: 1px solid #d0d7de; padding: 10px 13px; text-align: left; }
    .markdown-body th { background-color: #f6f8fa; font-weight: 600; color: #24292e; }
    .markdown-body tr:nth-child(2n) { background-color: #f6f8fa; }
    .markdown-body a { color: #0366d6; text-decoration: none; font-weight: 500; }
    .markdown-body a:hover { text-decoration: underline; }
    .markdown-body blockquote { border-left: 4px solid #0366d6; padding: 12px 20px; margin: 20px 0; color: #57606a; font-style: italic; background: #f6f8fa; border-radius: 0 6px 6px 0; }
    .markdown-body blockquote > :first-child { margin-top: 0; }
    .markdown-body blockquote > :last-child { margin-bottom: 0; }
    .markdown-body hr { height: 3px; padding: 0; margin: 28px 0; background-color: #e1e4e8; border: 0; }
    img { max-width: 100%; height: auto; display: block; margin: 16px auto; }
    img:not([width]):not([height]):not([src*="icon"]):not([src*="logo"]):not([src^="data:image/svg"]) { min-width: 300px; max-width: 85%; display: block; margin: 20px auto; }
    p > img:only-child { min-width: 400px !important; max-width: 90% !important; display: block !important; margin: 24px auto !important; }
    img[src^="data:image/svg"] { max-width: 32px !important; max-height: 32px !important; min-width: auto !important; display: inline-block !important; vertical-align: middle; margin: 0 4px !important; }
    img[width][width*="16"], img[width][width*="20"], img[width][width*="24"], img[width][width*="32"], img[height][height*="16"], img[height][height*="20"], img[height][height*="24"], img[height][height*="32"] { max-width: 32px !important; max-height: 32px !important; min-width: auto !important; display: inline-block !important; vertical-align: middle; margin: 0 4px !important; width: auto !important; height: auto !important; }
    img[src*="icon"], img[src*="logo"], img[class*="icon"], img[class*="logo"] { max-width: 40px !important; max-height: 40px !important; min-width: auto !important; display: inline-block !important; vertical-align: middle; margin: 0 6px !important; }
    h1 img[width], h2 img[width], h3 img[width], h4 img[width], h5 img[width], h6 img[width], li img[width] { max-width: 28px !important; max-height: 28px !important; min-width: auto !important; display: inline-block !important; vertical-align: middle; margin: 0 4px !important; }
    hr { border: none; border-top: 2px solid #e1e4e8; margin: 24px 0; }
    @media print {
      body { font-size: 12pt; }
      .page-break { page-break-after: always; border: none; margin: 0; padding: 0; }
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
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = PDFGeneratorLarge;
