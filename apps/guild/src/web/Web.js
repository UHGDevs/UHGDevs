
const os = require('os');
const express = require('express');

const path = require('node:path');
const fs = require('fs');

class Web {
    constructor(uhg) {
        this.uhg = uhg
        this.app = express();
        this.connectWeb()
        
    }

    async connectWeb() {
        let app = this.app
        
        app.use('/home', (req, res) => {
            const uptime = Math.floor(process.uptime());

            const data = {
              uptime: uptime,
              status: 'RUNNING',
              date: new Date()
            };
          
            res.status(200).json(data);
        });

        app.use('/api', async (req, res) => {
            let query = req.query
            if (!query.user) return res.status(400).json({success: false, reason: 'Missing USER'})
            if (!query.api) return res.status(401).json({success: false, reason: 'Missing API'})
            let api = await this.uhg.api.call(query.user, query.api.split(',').map(n => n.toLowerCase().trim()))
            res.status(200).json(api);
        });


        app.listen(7854, () => {console.log('WEBSITE ON')});
    }


}

module.exports = Web