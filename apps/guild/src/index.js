process.on('uncaughtException', function (error) {console.error(error)})
process.title = 'By UHGDevs'
global.delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const dotenv = require('dotenv');
dotenv.config();

require('./utils/Logger');

const uhg = require('./UHGDevs')
global.uhg = uhg

uhg.appStart().then( uhg.appConnect() ).catch(console.error)


process.on('SIGINT', async () => {
    if (global.shuting === true) return
    uhg.stopBot('Discord BOT byl násilně ukončen')
})