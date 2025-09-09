import postcssUrl from "postcss-url";
import { purgeCSSPlugin } from "@fullhuman/postcss-purgecss";
import pruneVar from "postcss-prune-var";
import varCompress from "postcss-variable-compress";
import cssnano from "cssnano";

export default {
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
