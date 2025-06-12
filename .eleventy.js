// .eleventy.js

const dateFilter = require('nunjucks-date-filter');

module.exports = function(eleventyConfig) {
  // 將整個 css 資料夾複製到輸出的網站中
  eleventyConfig.addPassthroughCopy("css");

  // 添加日期格式化篩選器
  eleventyConfig.addFilter('date', dateFilter);

  // （可選）監控 CSS 檔案的變更
  eleventyConfig.addWatchTarget("./css/");

  // *** DEBUGGING: 在建置後，將所有集合的資訊印出來 ***
  eleventyConfig.on('afterBuild', async () => {
    // 透過非同步的方式取得完整的集合資料
    const collections = await eleventyConfig.getCollections();
    console.log("--- DEBUGGING COLLECTIONS ---");
    // 印出所有可用的集合名稱
    console.log("Available collections:", Object.keys(collections));
    
    // 檢查 'post' 集合是否存在，以及裡面有多少項目
    if (collections.post) {
      console.log(`'post' collection found with ${collections.post.length} items.`);
    } else {
      console.log("'post' collection NOT found.");
    }
    console.log("---------------------------");
  });

  // 返回 Eleventy 的設定物件
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    // Eleventy 會處理的檔案格式
    templateFormats: [
      "md",
      "njk",
      "html",
      "json"
    ],
  };
};
