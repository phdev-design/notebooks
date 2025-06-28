const { DateTime } = require("luxon");
const { transliterate } = require('transliteration');

module.exports = function(eleventyConfig) {
  // 1. 複製靜態資源
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // 2. 新增所有需要的 Filter
  eleventyConfig.addFilter("date", (dateObj, format = "yyyy-MM-dd") => {
    const dt = DateTime.fromISO(dateObj, { zone: 'utc' });
    return dt.isValid ? dt.toFormat(format) : "無效日期";
  });

  eleventyConfig.addFilter("slug", (str) => {
    if (!str) return "";
    return transliterate(str).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    const dt = DateTime.fromISO(dateObj, { zone: 'utc' });
    return dt.isValid ? dt.toISO() : "";
  });
  
  eleventyConfig.addFilter("stripHtml", content => content ? String(content).replace(/<[^>]*>/g, '') : '');

  eleventyConfig.addFilter("randomLimit", (arr, limit) => {
    const shuffled = [...arr];
    let currentIndex = shuffled.length;
    let randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled.slice(0, limit);
  });
  
  // 我們保留這個有用的篩選器
  eleventyConfig.addFilter("filterByTag", (posts, tag) => {
    if (!posts || !tag) {
      return [];
    }
    return posts.filter(post => post.tags && post.tags.includes(tag));
  });

  // 3. 專案目錄設定
  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html", "json"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};