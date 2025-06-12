// .eleventy.js

// 引入您用來格式化日期的 'nunjucks-date-filter' 套件
const dateFilter = require('nunjucks-date-filter');

module.exports = function(eleventyConfig) {
  // *** 將整個 css 資料夾複製到輸出的網站中 ***
  eleventyConfig.addPassthroughCopy("css");

  // 添加您在範本中正在使用的日期格式化篩選器
  eleventyConfig.addFilter('date', dateFilter);

  // （可選）讓 Eleventy 在開發模式下也能監控 CSS 檔案的變更
  eleventyConfig.addWatchTarget("./css/");

  // 注意：我們已經移除了手動建立 'postsData' 的部分。
  // Eleventy 的 collection 系統現在會自動處理所有標籤為 'post' 的筆記。
  
  // 返回 Eleventy 的設定物件
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    // Eleventy 會處理的檔案格式
    // *** 關鍵修復：告訴 Eleventy 也要處理 .json 檔案 ***
    templateFormats: [
      "md",
      "njk",
      "html",
      "json" // <--- 將這一行加進來
    ],
  };
};
