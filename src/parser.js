const cheerio = require('cheerio');
const urlHelper = require('./utils/urlHelper');
const TurndownService = require('turndown');

class Parser {
  constructor(config) {
    this.config = config;
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '_',
      strongDelimiter: '**'
    });
    
    // 配置图片转换规则
    this.turndownService.addRule('images', {
      filter: 'img',
      replacement: (content, node) => {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        const title = node.getAttribute('title') || '';
        const width = node.getAttribute('width') || '';
        const height = node.getAttribute('height') || '';
        
        // 保留尺寸信息作为 HTML 注释
        let sizeInfo = '';
        if (width || height) {
          sizeInfo = ` <!-- size: ${width}x${height} -->`;
        }
        
        if (title) {
          return `![${alt}](${src} "${title}")${sizeInfo}`;
        }
        return `![${alt}](${src})${sizeInfo}`;
      }
    });
    
    // 保留代码块的语言标记
    this.turndownService.addRule('codeBlocks', {
      filter: (node) => {
        return node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE';
      },
      replacement: (content, node) => {
        const codeNode = node.firstChild;
        const language = codeNode.getAttribute('class')?.replace(/^language-/, '') || '';
        const code = codeNode.textContent;
        return '\n```' + language + '\n' + code + '\n```\n';
      }
    });
  }

  extractLinks(html, baseURL, navSelectors) {
    const $ = cheerio.load(html);
    let bestLinks = new Set();
    let maxCount = 0;

    // 尝试所有导航选择器，选择匹配最多的
    for (const selector of navSelectors) {
      const currentLinks = new Set();
      
      $(selector).each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          const normalizedURL = urlHelper.normalizeURL(href, baseURL);
          if (normalizedURL && urlHelper.isSameOrigin(normalizedURL, baseURL)) {
            currentLinks.add(normalizedURL);
          }
        }
      });
      
      // 保留链接数最多的选择器结果
      if (currentLinks.size > maxCount) {
        maxCount = currentLinks.size;
        bestLinks = currentLinks;
      }
    }

    return Array.from(bestLinks);
  }

  extractContent(html, contentSelectors) {
    const $ = cheerio.load(html);
    
    // 尝试所有内容选择器
    for (const selector of contentSelectors) {
      const content = $(selector);
      if (content.length > 0) {
        // 克隆内容以避免修改原始 DOM
        const cloned = content.clone();
        
        // 移除无关元素（更全面）
        cloned.find([
          'nav',
          'header', 
          'footer',
          'aside',
          '.sidebar',
          '.nav',
          '.navigation',
          '.navbar',
          '.header',
          '.footer',
          '.advertisement',
          '.ad',
          '.breadcrumb',
          '.breadcrumbs',
          '[role="navigation"]',
          '[role="banner"]',
          '[role="contentinfo"]',
          '[aria-label*="navigation"]',
          '[aria-label*="breadcrumb"]'
        ].join(',')).remove();
        
        return cloned.html();
      }
    }

    // 如果没有找到，返回 body 内容并清理
    const body = $('body');
    body.find('nav, header, footer, aside, .sidebar').remove();
    return body.html();
  }

  extractTitle(html) {
    const $ = cheerio.load(html);
    
    // 尝试多种方式获取标题
    let title = $('h1').first().text().trim();
    if (!title) {
      title = $('title').text().trim();
    }
    if (!title) {
      title = 'Untitled';
    }
    
    return title;
  }

  cleanContent(html) {
    if (!html) return '';
    
    const $ = cheerio.load(html);
    
    // 移除脚本、样式和交互元素
    $([
      'script',
      'style',
      'iframe',
      'noscript',
      'button',
      'input',
      'select',
      'textarea',
      'form'
    ].join(',')).remove();
    
    // 移除导航和页眉页脚元素
    $([
      'nav',
      'header',
      'footer',
      'aside'
    ].join(',')).remove();
    
    // 移除常见的无关类元素
    $([
      '.copy-button',
      '.edit-page',
      '.edit-link',
      '.page-edit',
      '.github-link',
      '.edit-this-page',
      '.breadcrumb',
      '.breadcrumbs',
      '.toc',
      '.table-of-contents',
      '.sidebar',
      '.navigation',
      '.navbar',
      '.header',
      '.footer',
      '.ad',
      '.advertisement',
      '.banner',
      '.promo',
      '.popup',
      '.modal',
      '.cookie-banner',
      '.feedback',
      '.share-buttons',
      '.social-share',
      '.related-articles',
      '.next-prev',
      '.pagination'
    ].join(',')).remove();
    
    // 移除特定属性的元素
    $([
      '[role="navigation"]',
      '[role="banner"]',
      '[role="contentinfo"]',
      '[role="complementary"]',
      '[aria-label*="navigation"]',
      '[aria-label*="breadcrumb"]',
      '[aria-label*="sidebar"]',
      '[class*="skip-"]',
      '[id*="sidebar"]',
      '[id*="header"]',
      '[id*="footer"]',
      '[id*="nav"]'
    ].join(',')).remove();
    
    // 移除隐藏元素
    $('[style*="display: none"]').remove();
    $('[style*="display:none"]').remove();
    $('[hidden]').remove();
    $('.hidden').remove();
    
    // 移除空元素（但保留图片和 br）
    $('*').each((_, el) => {
      const $el = $(el);
      if ($el.is('img, br, hr')) return;
      if ($el.children().length === 0 && $el.text().trim() === '') {
        $el.remove();
      }
    });
    
    return $.html();
  }

  /**
   * 将 HTML 转换为 Markdown
   */
  htmlToMarkdown(html) {
    if (!html) return '';
    
    try {
      const markdown = this.turndownService.turndown(html);
      return markdown;
    } catch (error) {
      console.warn('Markdown 转换失败，使用原始 HTML:', error.message);
      return html;
    }
  }

  /**
   * 转换并清理内容为 Markdown
   */
  convertToMarkdown(html) {
    // 先清理 HTML
    const cleanedHtml = this.cleanContent(html);
    
    // 转换为 Markdown
    const markdown = this.htmlToMarkdown(cleanedHtml);
    
    return markdown;
  }
}

module.exports = Parser;
