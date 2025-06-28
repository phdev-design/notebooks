const fs = require('fs');
const path = require('path');
const { DateTime } = require("luxon");

const postsDirectory = path.join(__dirname, '../posts');

/**
 * 讀取並處理所有文章的資料
 */
module.exports = () => {
  const postFiles = fs.readdirSync(postsDirectory);

  const posts = postFiles.map(file => {
    // 只處理 .json 檔案
    if (path.extname(file) !== '.json') {
      return null;
    }

    const filePath = path.join(postsDirectory, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      const postData = JSON.parse(fileContent);
      
      // 關鍵：檢查日期是否存在且有效，如果無效就跳過此檔案，避免網站崩潰
      if (!postData.date || !DateTime.fromISO(postData.date).isValid) {
          console.warn(`[data] ⚠️  正在跳過文章 "${file}"，因為缺少或日期格式無效。`);
          return null;
      }
      return postData;
    } catch (e) {
      console.error(`❌ 錯誤：無法解析檔案 ${file} 的 JSON 內容。`);
      return null;
    }
  }).filter(Boolean); // 過濾掉所有被跳過的 null 項目

  // 根據日期進行排序 (最新的在最前面)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};
