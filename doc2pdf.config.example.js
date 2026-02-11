// 示例配置文件
// 在项目根目录创建 doc2pdf.config.js 使用此配置

module.exports = {
  // 导航链接选择器（按优先级尝试）
  navSelectors: [
    '.sidebar nav a',
    '.docs-sidebar a',
    'aside nav a',
    '[role="navigation"] a',
    '.toc a',
    '.menu a',
  ],

  // 内容区域选择器（按优先级尝试）
  contentSelectors: [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.docs-content',
    '.markdown-body',
  ],

  // 页面加载超时（毫秒）
  timeout: 30000,

  // 并发爬取数
  concurrency: 3,

  // 排除模式（URL 包含这些字符串的页面将被跳过）
  excludePatterns: [
    '/api/',
    '/blog/',
  ],

  // PDF 生成选项
  pdfOptions: {
    format: 'A4', // 可选: 'Letter', 'Legal', 'A4', 'A3' 等
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true
  }
};
