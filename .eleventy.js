module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy('icons')
    eleventyConfig.addPassthroughCopy('assets')

    eleventyConfig.addFilter('stringify', (data) => {
        return JSON.stringify(data, null, "\t")
    })
}