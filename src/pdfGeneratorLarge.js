const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');

class PDFGeneratorLarge {
  constructor(config) {
    this.config = config;
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .page-container { padding: 20px; }
    .page-header { border-bottom: 2px solid #e1e4e8; padding-bottom: 16px; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; margin-bottom: 8px; color: #1a1a1a; }
    .page-url { font-size: 12px; color: #666; font-family: monospace; }
    .page-content { font-size: 14px; }
    .page-break { page-break-after: always; margin: 40px 0; border-top: 2px dashed #ccc; padding-top: 20px; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 24px; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
    h2 { font-size: 20px; border-bottom: 1px solid #eaecef; padding-bottom: 6px; }
    h3 { font-size: 18px; }
    p { margin-bottom: 16px; }
    ul, ol { margin-bottom: 16px; padding-left: 32px; }
    li { margin-bottom: 4px; }
    code { background-color: #f6f8fa; border-radius: 3px; padding: 2px 6px; font-family: monospace; font-size: 85%; color: #e83e8c; }
    pre { background-color: #f6f8fa; border-radius: 6px; padding: 16px; overflow-x: auto; margin-bottom: 16px; }
    pre code { background-color: transparent; padding: 0; color: #333; font-size: 12px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 16px; font-size: 13px; }
    th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
    th { background-color: #f6f8fa; font-weight: 600; }
    a { color: #0366d6; text-decoration: none; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; margin-bottom: 16px; color: #666; }
    img { max-width: 100%; height: auto; margin: 16px 0; }
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
