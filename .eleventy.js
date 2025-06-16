// .eleventy.js

const { slugify } = require("transliteration");
const dateFilter = require('nunjucks-date-filter');
const glob = require('glob');
// ✨ 引入 Node.js 內建的檔案系統模組
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // --- 靜態檔案複製 ---
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("img");

  // --- 過濾器 ---
  eleventyConfig.addFilter('date', dateFilter);
  eleventyConfig.addFilter("slug", (str) => {
    if (!str) return "";
    return slugify(str, { lower: true, separator: '-' });
  });

  // --- 集合 (Collection) ---
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    // =======================================================
    // ✨ 最終解決方案：手動讀取檔案來建立標籤列表 ✨
    // 1. 使用我們確認可行的 glob 來掃描所有 .json 檔案
    const files = glob.sync("./posts/*.json");
    let tagSet = new Set();

    files.forEach(file => {
      // 2. 排除掉設定檔本身
      if (file.endsWith('posts.11tydata.json')) {
        return;
      }
      
      try {
        // 3. 讀取每個檔案的內容
        const content = fs.readFileSync(file, 'utf8');
        // 4. 將內容解析為 JSON 物件
        const data = JSON.parse(content);

        // 5. 從解析後的資料中提取 tags 陣列
        if (Array.isArray(data.tags)) {
          data.tags.forEach(tag => tagSet.add(tag));
        }
      } catch (e) {
        console.error(`處理檔案 ${file} 時發生錯誤:`, e);
      }
    });
    // =======================================================

    // 將 Set 轉換為陣列並排序
    return [...tagSet].sort().slice(0, 10);

  });

  // --- 監控變更 ---
  eleventyConfig.addWatchTarget("./css/");
  eleventyConfig.addWatchTarget("./img/");

  // --- 設定物件 ---
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
  };
};
