// .eleventy.js

const dateFilter = require('nunjucks-date-filter');

module.exports = function(eleventyConfig) {
  // 將整個 css 資料夾複製到輸出的網站中
  eleventyConfig.addPassthroughCopy("css");

  // 添加日期格式化篩選器
  eleventyConfig.addFilter('date', dateFilter);

  // （可選）監控 CSS 檔案的變更
  eleventyConfig.addWatchTarget("./css/");
  
  // 返回 Eleventy 的設定物件
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    // 恢復預設，我們不再需要手動處理 json
    templateFormats: [
      "md",
      "njk",
      "html",
    ],
  };
};
