// .eleventy.js

// 1. 在檔案最上方，加入這一行來引入套件
//    (請記得先在終端機執行 npm install transliteration)
const { slugify } = require("transliteration");
const dateFilter = require('nunjucks-date-filter');

module.exports = function(eleventyConfig) {
  // --- 您的既有設定 (維持不變) ---
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addFilter('date', dateFilter);
  eleventyConfig.addWatchTarget("./css/");
  eleventyConfig.addWatchTarget("./img/");

  // --- 2. 在這裡加入我們需要的新功能 ---

  // 功能一：新增 slug 過濾器
  // 作用：將「中文標籤」或任何字串，轉換成 URL 友善的格式
  // 範例： "前端開發" -> "qian-duan-kai-fa"
  eleventyConfig.addFilter("slug", (str) => {
    if (!str) return;
    return slugify(str, { lower: true, separator: '-' });
  });

  // 功能二：新增「標籤列表(tagList)」的 Collection
  // 作用：自動掃描您所有 posts/*.json 檔案中的 "tags" 陣列，
  //       並建立一個不重複、已排序的所有標籤清單。
  //       我們可以在範本中用 `collections.tagList` 來存取這個清單。
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const postsCollection = collectionApi.getFilteredByTag("posts");
    let tagSet = new Set();
    
    postsCollection.forEach(item => {
      if (Array.isArray(item.data.tags)) {
        item.data.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return [...tagSet].sort();
  });


  // --- 3. 返回 Eleventy 的設定物件 (維持不變) ---
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: [
      "md",
      "njk",
      "html",
    ],
  };
};