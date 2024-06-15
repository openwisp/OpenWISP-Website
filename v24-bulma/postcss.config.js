const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const pruneVar = require('postcss-prune-var')
const varCompress = require('postcss-variable-compress')

module.exports = {
    // parser: 'postcss-scss',
    plugins: [
        // purgecss({
        //     // file paths to your contents to remove unused styles.
        //     content: ['./**/*.html'],
        // }),
        pruneVar(), // remove unused css variables
        varCompress(), // compress css variables
        cssnano({
            preset: 'default',
        }),
    ],
};
