import nfetch from 'node-fetch'
import { parse } from 'node-html-parser'
import { LocalStorage } from 'node-localstorage'

const localStorage = new LocalStorage('./localstorage')

const requestFragment = async () => {
    const text = await nfetch('https://fragment.com/?sort=ending').then(data => data.text())

    const root = parse(text)

    const usernames = []
    
    const data = root.querySelector('tbody.tm-high-cells').childNodes.filter(data => data.querySelector)

    for (let x = 0; x < data.length; x++) {
        const username = data[x]
        const isResale = !!(username.querySelector('div.table-cell-status-thin')?.innerText)

        if (!isResale) {
            const name = username.querySelector('a.table-cell').getAttribute('href').replace(/\/username\//gi, '')
                , time = username.querySelector('time').innerText
                , ton = username.querySelector('div.icon-ton').innerText

            const oldValue = localStorage.getItem(name)
                , newValue = `${name}-${ton}`

            if (oldValue !== newValue) {
                localStorage.setItem(name, newValue)
                usernames.push({ name, ton, time })
            }
        }
    }

    return usernames
}

const loop = async () => {
    const data = await requestFragment()

    console.log(data)
}

setInterval(loop, 60000 * 5)
loop()