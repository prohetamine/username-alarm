import nfetch from 'node-fetch'
import { parse } from 'node-html-parser'
import { LocalStorage } from 'node-localstorage'
import sleep from 'sleep-promise'
import { Telegraf } from 'telegraf'

const bot = new Telegraf('8094533054:AAG7eGjNE9oPr-HZOLtqoL-3PFMUhpsq_ms')

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

    for (let x = 0; x < data.length; x++) {
        const { name, ton, time } = data[x]
        try {
            await bot.telegram.sendMessage(-1002921292662, `@${name} — ${ton} ton \\[${time}\\] [link](https://fragment\\.com/username/${name})`, {
                parse_mode: 'MarkdownV2', 
                link_preview_options: {
                    is_disabled: true
                }
            })
        } catch (e) {}
        await sleep(2000)
    }
}

setInterval(loop, 60000 * 1)
loop()