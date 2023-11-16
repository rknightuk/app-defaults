import { extract } from '@extractus/article-extractor'
import { DOMParser, parseHTML } from 'linkedom'
import fs from 'fs'

const normaliseUrl = (url) => {
    return url.replace(/\/$/, '')
}

const sites = JSON.parse(fs.readFileSync('../_data/sites.json'))

const generatePostDataFromSites = () => {
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
        const url = normaliseUrl(site.url)
        data[url] = {
            ...site,
            id: i + 1,
            urlKey: url,
            links: [],
            url: url,
        }
    })

    return data
}

const run = async () => {
    const postDataPath = '../_data/postdata.json'
    let postdata = {}
    if (fs.existsSync(postDataPath)) {
        postdata = JSON.parse(fs.readFileSync(postDataPath))

        const sites = JSON.parse(fs.readFileSync('../_data/sites.json'))
        const existingUrls = Object.values(postdata).map(s => normaliseUrl(s.url))

        let currentSite = null
        let currentUrl = null
        for (let i = 0; i < sites.length; i++) {
            currentSite = sites[i]
            currentUrl = normaliseUrl(currentSite.url)
            if (!existingUrls.includes(currentUrl)) {
                console.log('Running for ' + currentSite.url)
                postdata[currentUrl] = {
                    ...currentSite,
                    id: i + 1,
                    urlKey: currentUrl,
                    links: [],
                    url: currentUrl,
                }

                try {
                    const article = await extract(currentUrl)
                    if (article && article.content) {
                        const { document } = parseHTML(article.content)
                        document.querySelectorAll('a').forEach((a) => {
                            const foundLink = normaliseUrl(a.href)
                            if (postdata[currentUrl]) {
                                if (postdata[foundLink]) {
                                    postdata[foundLink].links.push(currentUrl)
                                }
                            }
                        })
                    }
                } catch (err) {
                    console.error(err)
                }
            }
        }
    } else {
        postdata = generatePostDataFromSites()

        let currentSite = null
        let currentUrl = null
        for (let i = 0; i < sites.length; i++) {
            currentSite = sites[i]
            currentUrl = normaliseUrl(currentSite.url)
            console.log('Running for ' + currentUrl)
            postdata[currentUrl] = {
                ...currentSite,
                id: i + 1,
                urlKey: currentUrl,
                links: [],
                url: currentUrl,
            }

            try {
                const article = await extract(currentUrl)
                if (article && article.content) {
                    const { document } = parseHTML(article.content)
                    document.querySelectorAll('a').forEach((a) => {
                        const foundLink = normaliseUrl(a.href)
                        if (postdata[currentUrl]) {
                            if (postdata[foundLink]) {
                                postdata[foundLink].links.push(currentUrl)
                            }
                        }
                    })
                }
            } catch (err) {
                console.error(err)
            }
        }
    }

    fs.writeFileSync(postDataPath, JSON.stringify(postdata, null, 2))

    const nodes = []
    const edges = []

    Object.values(postdata).forEach((d) => {
        const hosts = ['Andrew Canion', 'Jason Burk', 'Martin Feld']
        nodes.push({
            id: d.id,
            label: d.name,
            url: d.url,
            rss: d.rss,
            shape: 'box',
            color: (d.id >= 1000 || hosts.includes(d.name)) ? '#fdbd30' : '#03a4df',
            linkCount: (d.links || []).length,
        })
        d.links.forEach((link) => {
            const id = postdata[normaliseUrl(link)]?.id
            if (id && id !== d.id)
            {
                edges.push({
                    from: d.id,
                    to: id,
                })
            }
        })
    })

    fs.writeFileSync('../_data/nodes.json', JSON.stringify({ nodes, edges}, '', 2))
}

run()