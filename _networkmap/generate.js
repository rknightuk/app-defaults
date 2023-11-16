import { extract } from '@extractus/article-extractor'
import { DOMParser, parseHTML } from 'linkedom'
import fs from 'fs'

const sites = JSON.parse(fs.readFileSync('../_data/sites.json'))
// const sites = [
//     { "name": "Gabz", "url": "https://gabz.blog/2023/11/03/my-defaults.html", "rss": "https://gabz.blog/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Robb Knight", "url": "https://rknight.me/app-defaults/", "rss": "https://rknight.me/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Maique", "url": "https://maique.eu/2023/11/03/defaults.html", "rss": "https://maique.eu/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Leon Mika", "url": "https://lmika.org/2023/11/04/defaults.html", "rss": "https://lmika.org/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Zachary", "url": "https://alpine.weblog.lol/2023/11/the-defaults", "rss": "https://alpine.weblog.lol/rss.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Andrew Canion", "url": "https://canion.blog/2023/11/04/duel-of-the.html", "rss": "https://canion.blog/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Andy Carolan", "url": "https://www.andycarolan.com/appdefaults" , "date": "2023-11-07 16:49"},
//     { "name": "Marco", "url": "https://mb.esamecar.net/2023/11/04/app-defaults.html", "rss": "https://mb.esamecar.net/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Matt", "url": "https://matt.routleynet.org/2023/11/04/duel-of-the.html", "rss": "https://matt.routleynet.org/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Neil Macy", "url": "https://www.neilmacy.co.uk/blog/app-defaults", "rss": "https://www.neilmacy.co.uk/feed.rss" , "date": "2023-11-07 16:49"},
//     { "name": "Qiu", "url": "https://mastodon.social/@Qiu/111354288897085324" , "date": "2023-11-07 16:49"},
//     { "name": "Habib", "url": "https://www.chamline.net/default-apps/", "rss": "https://www.chamline.net/blog/rss/" , "date": "2023-11-07 16:49"},
//     { "name": "Stefan", "url": "https://eay.cc/2023/my-app-defaults/", "rss": "https://eay.cc/feed/" , "date": "2023-11-07 16:49"},
//     { "name": "fLaMEd", "url": "https://flamedfury.com/posts/app-defaults", "rss": "https://flamedfury.com/feed.xml/" , "date": "2023-11-07 16:49"},
//     { "name": "Laker", "url": "https://txt.laker.tech/defaults" , "date": "2023-11-07 16:49"},
//     { "name": "Jarrod Blundy", "url": "https://heydingus.net/blog/2023/11/duel-of-the-defaults-jarrod-enters-the-ring", "rss": "https://heydingus.net/feed.rss" , "date": "2023-11-07 16:49"},
//     { "name": "Sylvia", "url": "https://sylvia.micro.blog/2023/11/05/my-defaults.html", "rss": "https://sylvia.micro.blog/feed.xml" , "date": "2023-11-07 16:49"},
//     { "name": "Esteban", "url": "https://umerez.eu/2023/11/03/defaults.html" , "date": "2023-11-07 16:49"},
// ]

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
        nodes.push({
            id: d.id,
            label: d.name,
            url: d.url,
            rss: d.rss,
            shape: 'box',
            color: d.id < 100 ? '#fdbd30' : '#03a4df',
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
