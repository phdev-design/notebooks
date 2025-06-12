// .eleventy.js

// 引入 Node.js 內建的檔案系統和路徑模組
const fs = require('fs');
const path = require('path');

// 引入您用來格式化日期的 'nunjucks-date-filter' 套件
const dateFilter = require('nunjucks-date-filter');

module.exports = function(eleventyConfig) {

  // *** 將整個 css 資料夾複製到輸出的網站中 ***
  eleventyConfig.addPassthroughCopy("css");

  // 添加您在範本中正在使用的日期格式化篩選器
  eleventyConfig.addFilter('date', dateFilter);

  // （可選）讓 Eleventy 在開發模式下也能監控 CSS 檔案的變更
  eleventyConfig.addWatchTarget("./css/");

  // *** 新增：建立一個全域資料變數 'postsData' ***
  // 這段程式碼會讀取 'posts' 資料夾中的所有 .json 檔案
  eleventyConfig.addGlobalData("postsData", () => {
    const postsDir = path.join(__dirname, 'posts');
    const posts = [];

    try {
      // 讀取 posts 資料夾裡的所有檔案名稱
      const files = fs.readdirSync(postsDir);

      for (const file of files) {
        // 只處理 .json 結尾的檔案
        if (path.extname(file) === '.json') {
          const filePath = path.join(postsDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          try {
            const data = JSON.parse(fileContent);
            // 為了讓範本中的連結能正常運作，我們手動加上 URL 屬性
            data.url = `posts/${file}`;
            posts.push(data);
          } catch (e) {
            console.error(`Error parsing JSON from file: ${file}`, e);
          }
        }
      }
    } catch (e) {
      console.error(`Error reading posts directory: ${postsDir}`, e);
      return []; // 如果讀取目錄失敗，返回空陣列
    }

    // 將所有文章依照日期從新到舊排序
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  // 返回 Eleventy 的設定物件
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
