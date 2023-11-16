import { extract } from '@extractus/article-extractor'
import { DOMParser, parseHTML } from 'linkedom'
import fs from 'fs'

const sites = JSON.parse(fs.readFileSync('../_data/sites.json'))

const normaliseUrl = (url) => {
    return url.replace(/\/$/, '')
}

const data = {
    'https://listen.hemisphericviews.com/097': {
        id: 1000,
        urlKey: 'https://listen.hemisphericviews.com/097',
        url: 'https://listen.hemisphericviews.com/097',
        links: [],
        name: 'Hemispheric Views',
        shape: 'box',
    },
    'https://defaults.rknight.me': {
        id: 1001,
        urlKey: 'https://defaults.rknight.me',
        url: 'https://defaults.rknight.me',
        links: [],
        name: 'App Defaults',
        shape: 'box',
    },
}

sites.forEach((site, i) => {
    const url = site.url.replace(/\/$/, '')
    data[url] = {
        id: i + 1,
        urlKey: url,
        links: [],
        ...site,
    }
})

const run = async () => {
    // const ddd = JSON.parse(fs.readFileSync('./data.json'))
    for (let i = 0; i < sites.length; i++) {
        const input = sites[i].url

        try {
            const article = await extract(input)
            if (article && article.content) {
                const { document } = parseHTML(article.content)
                document.querySelectorAll('a').forEach((a) => {
                    const key = normaliseUrl(a.href)
                    if (data[key]) {
                        data[key].links.push(sites[i].url)
                    }
                })
            }
        } catch (err) {
            console.error(err)
        }
    }

    const nodes = []
    const edges = []

    Object.values(data).forEach((d) => {
        const hosts = ['Andrew Canion', 'Jason Burk', 'Martin Feld']
        nodes.push({
            id: d.id,
            label: d.name,
            url: d.url,
            rss: d.rss,
            shape: 'box',
            color: (d.id < 1000 || hosts.includes(d.name)) ? '#fdbd30' : '#03a4df',
        })
        d.links.forEach((link) => {
            const id = data[link]?.id
            if (id && id !== d.id)
            {
                edges.push({
                    from: d.id,
                    to: id,
                })
            }
        }) 
    })

    // fs.writeFileSync('../_data/data.json', JSON.stringify(data, '', 2))

    fs.writeFileSync('../_data/nodes.json', JSON.stringify({ nodes, edges}, '', 2))
}

run()
