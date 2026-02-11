const path = require('path');
const fs = require('fs');

class Config {
  constructor() {
    this.defaults = {
      navSelectors: [
        '.sidebar nav a',
        '.sidebar a',
        '[class*="sidebar"] a',
        '.docs-sidebar a',
        'aside nav a',
        'aside a',
        '[role="navigation"] a',
        '.toc a',
        '.menu a',
        'nav a',
        '.nav-links a',
        '[class*="menu"] a',
        '[class*="nav"] a'
      ],
      contentSelectors: [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.docs-content',
        '.markdown-body',
        '#content'
      ],
      timeout: 30000,
      concurrency: 3,
      excludePatterns: [],
      pdfOptions: {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      }
    };
  }

  load(customConfig = {}) {
    // 尝试加载配置文件
    const configPath = path.join(process.cwd(), 'doc2pdf.config.js');
    let fileConfig = {};
    
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath);
      } catch (error) {
        console.warn('Failed to load config file:', error.message);
      }
    }

    return {
      ...this.defaults,
      ...fileConfig,
      ...customConfig
    };
  }
}

module.exports = new Config();
