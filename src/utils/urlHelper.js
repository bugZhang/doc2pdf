const { URL } = require('url');

class URLHelper {
  normalizeURL(url, baseURL) {
    try {
      const urlObj = new URL(url, baseURL);
      // 移除锚点
      urlObj.hash = '';
      return urlObj.href;
    } catch (error) {
      return null;
    }
  }

  isSameOrigin(url1, url2) {
    try {
      const obj1 = new URL(url1);
      const obj2 = new URL(url2);
      return obj1.origin === obj2.origin;
    } catch (error) {
      return false;
    }
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  getOrigin(url) {
    try {
      return new URL(url).origin;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new URLHelper();
