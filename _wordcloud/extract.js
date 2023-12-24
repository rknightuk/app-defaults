import { extract } from '@extractus/article-extractor'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import fs from 'fs'

const sites = JSON.parse(fs.readFileSync('../_data/sites.json', 'utf8'))

const run = async () => {
    const words = [['foo', 12], ['bar', 6]]
    for (let i = 0; i < sites.length; i++) {
        const input = sites[i].url

        try {
            console.log('running for ' + input)
            if (['https://umerez.eu/2023/11/03/defaults.html'].includes(input)) continue
            if (fs.existsSync(`./output/${i}.md`)) continue
            const article = await extract(input)
            if (!article) console.log(sites[i].url)
            if (article) console.log(article.title)
            // const output = NodeHtmlMarkdown.translate(article.content)
            fs.writeFileSync(`./output/${i}.html`, article.content)
        } catch (err) {
            console.log('error caught')
            console.error(err)
        }

        // const input = fs.readFileSync('./output/1.html', 'utf8')
        // const x = input.replace(/<[^>]+>/g, '').replaceAll('\n', ' ').split(' ').filter(x => x.length > 2)
    }
}

run()