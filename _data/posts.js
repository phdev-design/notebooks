// _data/posts.js
const fs = require('fs');
const path = require('path');

module.exports = async function() {
  const postsDir = path.join(__dirname, '../posts');
  const posts = [];

  try {
    const files = fs.readdirSync(postsDir);

    for (const file of files) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          const data = JSON.parse(fileContent);
          // 加上一個 'slug' 屬性，用來建立獨一無二的 URL
          data.slug = path.basename(file, '.json');
          posts.push(data);
        } catch (e) {
          console.error(`Error parsing JSON from file: ${file}`, e);
        }
      }
    }
  } catch (e) {
    console.error(`Error reading posts directory: ${postsDir}`, e);
  }

  // 將所有筆記依照日期從新到舊排序
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};
