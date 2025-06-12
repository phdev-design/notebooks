// .eleventy.js

// 引入您用來格式化日期的 'nunjucks-date-filter' 套件
const dateFilter = require('nunjucks-date-filter');

module.exports = function(eleventyConfig) {

  // *** 關鍵設定：將整個 css 資料夾複製到輸出的網站中 ***
  // 這行指令會告訴 Eleventy 在建置網站時，
  // 要將您專案根目錄下的 'css' 資料夾，
  // 完整複製到最終的 `_site/css` 資料夾。
  eleventyConfig.addPassthroughCopy("css");

  // 添加您在範本中正在使用的日期格式化篩選器
  // 如果沒有這一行，{{ item.date | date('YYYY-MM-DD') }} 這個語法會失效
  eleventyConfig.addFilter('date', dateFilter);

  // （可選）讓 Eleventy 在開發模式下也能監控 CSS 檔案的變更
  eleventyConfig.addWatchTarget("./css/");

  // 返回 Eleventy 的設定物件
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    // 指定要處理的範本格式
    templateFormats: [
      "md",
      "njk",
      "html",
    ],
  };
};
