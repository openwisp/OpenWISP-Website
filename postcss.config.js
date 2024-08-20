const purgecss = require("@fullhuman/postcss-purgecss");
const cssnano = require("cssnano");
const pruneVar = require("postcss-prune-var");
const varCompress = require("postcss-variable-compress");
const importUrl = require("postcss-import-url");
const postcssImport = require("postcss-import");

module.exports = {
  plugins: [
    // embed imports
    importUrl({
      recursive: true,
      resolveUrls: true,
      modernBrowser: true,
    }),
    postcssImport(),
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
