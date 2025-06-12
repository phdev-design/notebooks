// posts/posts.11tydata.js

module.exports = {
    // 告訴 Eleventy，這個資料夾裡的所有筆記都屬於 "post" 這個集合
    tags: ["post"],
    // 指定所有筆記都使用我們剛剛建立的版型
    layout: "post-layout.njk",
    // 設定每一個頁面的永久連結 (URL)
    // 例如： 'my-post.json' 會變成 '/posts/my-post/'
    permalink: function (data) {
      // 取得不包含 .json 副檔名的檔案名稱
      const slug = data.page.fileSlug;
      return `/posts/${slug}/`;
    }
  };
  