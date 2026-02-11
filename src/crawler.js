const puppeteer = require('puppeteer');
const Parser = require('./parser');
const urlHelper = require('./utils/urlHelper');
const logger = require('./utils/logger');

class Crawler {
  constructor(config) {
    this.config = config;
    this.parser = new Parser(config);
    this.visited = new Set();
    this.pages = [];
    this.browser = null;
  }

  async init() {
    logger.info('启动浏览器...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async crawl(startURL) {
    if (!urlHelper.isValidURL(startURL)) {
      throw new Error('无效的 URL');
    }

    await this.init();

    try {
      logger.info(`开始爬取: ${startURL}`);
      
      // 访问起始页面
      const page = await this.browser.newPage();
      await page.goto(startURL, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });

      const html = await page.content();
      
      // 提取导航链接
      const links = this.parser.extractLinks(
        html,
        startURL,
        this.config.navSelectors
      );
      
      await page.close();

      logger.info(`发现 ${links.length} 个文档链接`);

      // 添加起始页面
      if (!links.includes(startURL)) {
        links.unshift(startURL);
      }

      // 爬取所有页面
      await this.crawlPages(links);

      return this.pages;
    } finally {
      await this.close();
    }
  }

  async crawlPages(urls) {
    const limit = this.config.concurrency;
    const queue = [...urls];
    const running = [];

    while (queue.length > 0 || running.length > 0) {
      // 启动新任务
      while (running.length < limit && queue.length > 0) {
        const url = queue.shift();
        const promise = this.crawlPage(url)
          .then(() => {
            const index = running.indexOf(promise);
            if (index > -1) running.splice(index, 1);
          })
          .catch(error => {
            logger.error(`爬取失败 ${url}: ${error.message}`);
            const index = running.indexOf(promise);
            if (index > -1) running.splice(index, 1);
          });
        running.push(promise);
      }

      // 等待至少一个任务完成
      if (running.length > 0) {
        await Promise.race(running);
      }
    }
  }

  async crawlPage(url) {
    if (this.visited.has(url)) {
      return;
    }

    this.visited.add(url);
    logger.info(`正在爬取: ${url}`);

    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });

      const html = await page.content();
      const title = this.parser.extractTitle(html);
      const content = this.parser.extractContent(html, this.config.contentSelectors);
      
      // 转换为 Markdown
      const markdown = this.parser.convertToMarkdown(content);

      this.pages.push({
        url,
        title,
        content: markdown,
        format: 'markdown'  // 标记内容格式
      });

      logger.success(`完成: ${title}`);
    } catch (error) {
      logger.error(`失败: ${url} - ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('浏览器已关闭');
    }
  }
}

module.exports = Crawler;
