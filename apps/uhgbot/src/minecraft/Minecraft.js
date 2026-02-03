/**
 * src/minecraft/Minecraft.js
 * Optimalizovaná verze se zapnutým chatem a vypnutou fyzikou.
 */

const mineflayer = require('mineflayer');
require('colors');

class Minecraft {
    constructor(uhg) {
        this.uhg = uhg;
        this.client = null;
        this.reconnectDelay = 10000;
        this.lastSent = null;
        this.retryCount = 0;
    }

    init() {
        if (!process.env.email) return console.log(' [MC] '.bgRed + ' Chybí údaje v .env!'.red);

        console.log(' [MC] '.bgGreen.black + ' Připojuji se k Hypixelu...'.green);

        // loadInternalPlugins: false jsme smazali, aby fungoval chat (event 'message')
        this.client = mineflayer.createBot({
            host: "mc.hypixel.net",
            username: process.env.email,
            //password: process.env.password,
            auth: "microsoft",
            version: "1.8.9",
            viewDistance: "tiny",
            checkTimeoutInterval: 30000,
            onMsaCode: (data) => this._handleMsaCode(data)
        });

        // RAM OPTIMALIZACE: Vypneme fyziku ihned po inicializaci
        this.client.on('inject_allowed', () => {
            this.client.physics.enabled = false;
        });

        this.uhg.mc.client = this.client; 

        this._registerEvents();
        this._startSendQueue();
    }

    async _handleMsaCode(data) {
        console.log(` [MSA] `.bgWhite.black + ` Kód: ${data.user_code}`.bold.yellow);
        const channelId = this.uhg.config.channels?.bot;
        let channel = this.uhg.dc.cache.channels.get('bot') || this.uhg.dc.client.channels.cache.get(channelId);

        if (channel) {
            const msg = await channel.send({
                embeds: [{
                    title: "Microsoft Auth",
                    description: `Odkaz: [microsoft.com/link](${data.verification_uri})\nKód: \`${data.user_code}\``,
                    color: 0x00AAFF
                }]
            });
            setTimeout(() => msg.delete().catch(() => {}), data.expires_in * 1000);
        }
    }

    _registerEvents() {
        this.client.on('login', () => {
            console.log(' [MC] '.bgGreen.black + ` Bot přihlášen.`.green);
            this.uhg.mc.ready = true;
            setTimeout(() => this.send("/limbo"), 1000);
        });

        this.client.on('message', (message) => {
            const raw = message.toString();
            const motd = message.toMotd();
            const clean = this.uhg.func.clear(raw);

            // --- ANTISPAM RETRY LOGIKA ---
            if (clean === "You cannot say the same message twice!" && this.lastSent) {
                const antiSpamSuffix = " [" + Math.random().toString(36).substring(2, 9) + "]";
                
                let retryMsg = this.lastSent + antiSpamSuffix;

                if (retryMsg.length > 256) {
                    retryMsg = this.lastSent.slice(0, 246) + antiSpamSuffix;
                }

                console.log(` [MC SPAM] `.bgRed.white + ` Detekováno opakování, posílám znovu s kódem: ${antiSpamSuffix}:\n${retryMsg}`.red);
                // Pošleme to na začátek fronty
                this.uhg.mc.send.unshift(retryMsg);
                this.lastSent = null; // Resetujeme, aby se to neopakovalo do nekonečna
                return;
            }

            // console.log(`[MC RAW]`.gray, raw);
            if (!raw.trim()) return;
            try {
                // Hot-reload handleru
                const handlerPath = require.resolve('./handler');
                delete require.cache[handlerPath];
                require('./handler')(this.uhg, raw, motd);
            } catch (e) {
                console.error(" [MC ERROR] Handler: ".red, e.message);
            }
        });

        this.client.on('end', (reason) => {
            console.log(' [MC] '.bgYellow.black + ` Odpojeno: ${reason}. Reconnect za 10s...`.yellow);
            this.uhg.mc.ready = false;
            this.uhg.mc.send = []; 
            this.lastSent = null;
            setTimeout(() => this.init(), this.reconnectDelay);
        });
        
        this.client.on('error', (err) => console.log(` [MC Error] ${err.message}`.red));
    }

    send(msg) {
        if (!msg || !this.uhg.mc.ready) return;
        const cleanMsg = String(msg).replace(/\*/g, '').trim();
         if (!cleanMsg) return;
        this.uhg.mc.send.push(cleanMsg);
    }

    _startSendQueue() {
        if (this.queueStarted) return;
        this.queueStarted = true;
        setInterval(() => {
            if (this.uhg.mc.send.length > 0 && this.uhg.mc.ready) {
                const msg = this.uhg.mc.send.shift();

                if (!msg.match(/ \[[a-z0-9]{3}\]$/)) {
                    this.lastSent = msg;
                 }

                this.client.chat(msg.slice(0, 256));
            }
        }, 800);
    }
}

module.exports = Minecraft;