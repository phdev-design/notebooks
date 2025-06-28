const fs = require('fs');
const path = require('path');

// 指向您的文章資料夾
const postsDirectory = path.join(__dirname, '../posts');
const postFiles = fs.readdirSync(postsDirectory);

const posts = postFiles.map(file => {
  // 忽略 macOS 的 .DS_Store 檔案
  if (file === '.DS_Store') {
    return null;
  }

  const filePath = path.join(postsDirectory, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let post;

  // 嘗試解析 JSON 檔案，如果失敗則會提示錯誤
  try {
    post = JSON.parse(fileContent);
  } catch (e) {
    console.error(`錯誤：無法解析檔案 ${file} 的 JSON 內容。`, e);
    return null; // 如果 JSON 格式錯誤，則跳過此檔案
  }
  
  // 從檔名建立一個 slug (網址的一部分)
  post.slug = file.replace(/\.json$/, '');

  // 【核心修正】將您 JSON 檔案中的日期字串轉換成 JavaScript 的 Date 物件。
  const dateValue = post.date;
  const dateObject = new Date(dateValue);
  
  // 【錯誤檢查】驗證日期格式是否正確。
  // 如果日期字串無效 (例如 "2025-02-30")，`new Date()` 會回傳一個無效的 Date 物件。
  // `isNaN(dateObject)` 就是用來檢查這個情況。
  if (isNaN(dateObject.getTime())) {
      console.error(`--- 警告：在檔案 [${file}] 中發現無效的日期 ---`);
      console.error(`--- 偵測到的日期為: "${dateValue}" ---`);
      // 我們保留這個無效的日期物件，讓後續的篩選器可以捕捉到它。
  }
  
  // 將處理過的 Date 物件存回 post 物件中。
  post.date = dateObject;
  
  return post;
}).filter(Boolean); // 過濾掉任何因為錯誤而產生的 null 值 (例如 .DS_Store 或格式錯誤的 JSON)

module.exports = () => {
  // 現在，排序是基於標準的 Date 物件，這樣更準確且可靠。
  return posts.sort((a, b) => b.date - a.date);
};
