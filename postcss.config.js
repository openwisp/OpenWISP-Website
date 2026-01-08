const postcssUrl = require("postcss-url");
const { purgeCSSPlugin } = require("@fullhuman/postcss-purgecss");
const pruneVar = require("postcss-prune-var");
const varCompress = require("postcss-variable-compress");
const cssnano = require("cssnano");

module.exports = {
  plugins: [
    postcssUrl({
      url: "inline",
      filter: /Inter-normal-\d+\.woff2$/,
      maxSize: Infinity,
    }),
    // remove unused CSS
    purgeCSSPlugin({
      content: ["**/*.html", "js/activity/feed.js"],
      safelist: ["is-active"],
    }),
    // remove unused css variables
    pruneVar(),
    // compress css variables
    varCompress(),
    // minify css
    cssnano({
      preset: "default",
    }),
  ],
};
