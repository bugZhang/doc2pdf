const cheerio = require('cheerio');
const urlHelper = require('./utils/urlHelper');

class Parser {
  constructor(config) {
    this.config = config;
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
        // 移除无关元素
        content.find('nav, header, footer, aside, .sidebar, .nav, .navigation, .advertisement, .ad').remove();
        return content.html();
      }
    }

    // 如果没有找到，返回 body 内容
    return $('body').html();
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
    
    // 移除脚本和样式
    $('script, style, iframe, .copy-button, button').remove();
    
    // 移除可能的无关元素
    $('.edit-page, .edit-link, .page-edit, .github-link').remove();
    
    return $.html();
  }
}

module.exports = Parser;
