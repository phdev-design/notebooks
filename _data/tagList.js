// _data/tagList.js
const { transliterate } = require('transliteration');
const posts = require('./posts.js')(); 

/**
 * 建立一個與 .eleventy.js 中 slug 過濾器行為一致的輔助函式。
 * 這能確保我們在資料處理階段就能預測出最終的 URL 路徑。
 */
const slugify = (str) => {
  if (!str) return "";
  // 轉換為拼音、轉小寫、將空格替換為連字號、移除不合規的字元
  return transliterate(str).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

module.exports = () => {
  // 使用 Map 來確保每個 slug 只對應一個標籤
  const tagMap = new Map();

  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        const slug = slugify(tag);
        // 如果這個 slug 還沒出現過，我們就將它和原始標籤存入 Map
        // 這會優先保留第一個遇到的標籤寫法（例如，先遇到「歷史」就保留它）
        if (!tagMap.has(slug)) {
          tagMap.set(slug, tag);
        }
      });
    }
  });
  // 從 Map 中取出所有獨一無二的標籤值，並進行排序
  return [...tagMap.values()].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
};