// _data/tagList.js
const posts = require('./posts.js')(); 

module.exports = () => {
  let tagSet = new Set();
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        // 【關鍵修正】在加入 Set 之前，就先將標籤統一轉成小寫
        // 這樣可以從根本上避免 "Interactive" 和 "interactive" 被當成兩個不同的標籤
        tagSet.add(tag.toLowerCase());
      });
    }
  });
  return [...tagSet].sort();
};