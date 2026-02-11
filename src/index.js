#!/usr/bin/env node

const { Command } = require('commander');
const ora = require('ora');
const path = require('path');
const Crawler = require('./crawler');
const PDFGenerator = require('./pdfGenerator');
const config = require('./utils/config');
const logger = require('./utils/logger');

const program = new Command();

program
  .name('doc2pdf')
  .description('将文档型网站转换为 PDF')
  .version('1.0.1')
  .argument('<url>', '文档网站的起始 URL')
  .option('-o, --output <path>', '输出 PDF 文件路径', './output/docs.pdf')
  .option('-s, --selector <selector>', '自定义导航选择器')
  .option('-c, --content <selector>', '自定义内容区域选择器')
  .option('-t, --timeout <ms>', '页面加载超时（毫秒）', '30000')
  .option('--concurrency <number>', '并发爬取数', '3')
  .option('-v, --verbose', '显示详细日志')
  .action(async (url, options) => {
    const startTime = Date.now();

    try {
      // 加载配置
      const customConfig = {};
      
      if (options.selector) {
        customConfig.navSelectors = [options.selector];
      }
      
      if (options.content) {
        customConfig.contentSelectors = [options.content];
      }
      
      if (options.timeout) {
        customConfig.timeout = parseInt(options.timeout);
      }
      
      if (options.concurrency) {
        customConfig.concurrency = parseInt(options.concurrency);
      }

      const cfg = config.load(customConfig);

      // 开始爬取
      const spinner = ora('正在爬取网站...').start();
      const crawler = new Crawler(cfg);
      
      let pages;
      try {
        pages = await crawler.crawl(url);
        spinner.succeed(`成功爬取 ${pages.length} 个页面`);
      } catch (error) {
        spinner.fail('爬取失败');
        throw error;
      }

      if (pages.length === 0) {
        logger.warning('没有找到任何页面');
        process.exit(1);
      }

      // 生成 PDF
      const pdfSpinner = ora('正在生成 PDF...').start();
      const generator = new PDFGenerator(cfg);
      
      try {
        const outputPath = path.resolve(options.output);
        await generator.generate(pages, outputPath);
        pdfSpinner.succeed('PDF 生成完成');
      } catch (error) {
        pdfSpinner.fail('PDF 生成失败');
        throw error;
      }

      // 显示统计信息
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.success(`\n总耗时: ${duration} 秒`);
      logger.success(`页面数: ${pages.length}`);
      logger.success(`输出文件: ${path.resolve(options.output)}`);

    } catch (error) {
      logger.error(`\n错误: ${error.message}`);
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

program.parse();
