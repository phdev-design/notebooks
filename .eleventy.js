const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // 複製靜態資源
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // 日期格式化
  eleventyConfig.addFilter("date", (dateObj, format) => {
    return DateTime.fromJSDate(dateObj).toFormat(format);
  });

  // ISO 日期格式（用於 RSS）
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISO();
  });

  // 建立標籤集合
  eleventyConfig.addCollection("tagList", function(collection) {
    const tagSet = new Set();
    collection.getAll().forEach(item => {
      if (item.data.tags && Array.isArray(item.data.tags)) {
        item.data.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return [...tagSet].sort();
  });

  // 建立文章集合（按日期排序）
  eleventyConfig.addCollection("posts", function(collection) {
    return collection.getFilteredByGlob("posts/*.json")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // 建立最新文章集合（用於 RSS）
  eleventyConfig.addCollection("recentPosts", function(collection) {
    return collection.getFilteredByGlob("posts/*.json")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
      .slice(0, 20); // 只取最新 20 篇
  });

  // 清理 HTML 標籤（用於 RSS 描述）
  eleventyConfig.addFilter("stripHtml", function(content) {
    return content.replace(/<[^>]*>/g, '');
  });

  // 截取文字（用於摘要）
  eleventyConfig.addFilter("truncate", function(text, length = 150) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};