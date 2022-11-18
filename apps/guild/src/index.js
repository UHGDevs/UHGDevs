process.on('uncaughtException', function (error) {console.error(error)})
process.title = 'By UHGDevs'
global.delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const dotenv = require('dotenv');
dotenv.config();

require('./utils/Logger');


const fs = require('fs');
const path = require('path');

let config = fs.readdirSync(path.join(__dirname, '../')).filter(n => n == 'config.json').length
if (!config) fs.writeFile(path.join(__dirname, '../config.json'),  JSON.stringify(defaultConfig(), null, 4), 'utf-8', data => {})

delay(config ? 0 : 100).then(async () => {

    const uhg = require('./UHGDevs')
    global.uhg = uhg

    await uhg.appStart()

    await uhg.appConnect()

})



process.on('SIGINT', async () => {
    if (global.shuting === true) return
    uhg.stopBot('Discord BOT byl násilně ukončen')
})