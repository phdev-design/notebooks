const fs = require("fs"); // 引入 Node.js 的檔案系統模組

module.exports = function(eleventyConfig) {
  // 複製靜態資源資料夾
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("admin");

  // --- 手動建立一個名為 "postsData" 的全域數據 ---
  eleventyConfig.addGlobalData("postsData", () => {
    const dataDir = "posts";
    // 檢查資料夾是否存在，若否，則回傳空陣列
    if (!fs.existsSync(dataDir)) {
      return [];
    }
    
    // 讀取 posts 資料夾下的所有檔名
    const files = fs.readdirSync(dataDir);
    
    // 遍歷所有檔名，讀取每個檔案的內容並解析成 JSON
    const allPosts = files
      .filter(file => file.endsWith('.json')) // 只處理 .json 檔案
      .map(file => {
        const filePath = `${dataDir}/${file}`;
        const fileContent = fs.readFileSync(filePath, "utf8");
        try {
          return JSON.parse(fileContent);
        } catch (e) {
          console.error(`Error parsing JSON from file: ${filePath}`, e);
          return null; // 若解析失敗，回傳 null
        }
      })
      .filter(post => post !== null); // 過濾掉解析失敗的檔案
      
    return allPosts;
  });
  // ---------------------------------------------
  
  // 加入 Nunjucks 的日期格式化過濾器
  const dateFilter = require("nunjucks-date-filter");
  eleventyConfig.addFilter("date", dateFilter);

  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};