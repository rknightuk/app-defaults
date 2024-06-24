module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy('icons')
    eleventyConfig.addPassthroughCopy('assets')

    eleventyConfig.ignores.add('_wordcloud/**/*.html')

    eleventyConfig.addFilter('stringify', (data) => {
        return JSON.stringify(data, null, "\t")
    })

    eleventyConfig.addPassthroughCopy('_redirects')
}