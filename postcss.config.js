const purgecss = require("@fullhuman/postcss-purgecss");
const cssnano = require("cssnano");
const pruneVar = require("postcss-prune-var");
const varCompress = require("postcss-variable-compress");
const postcssUrl = require("postcss-url");

module.exports = {
  plugins: [
    postcssUrl({
      url: "inline",
      filter: /Inter-normal-\d+\.woff2$/,
      maxSize: Infinity,
    }),
    // remove unused CSS
    purgecss({
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
