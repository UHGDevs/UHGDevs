/**
 * src/time/TimeHandler.js
 * Centrální správa časových úkolů s globálním ošetřením chyb.
 */

const cron = require('cron');
const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
require('colors');

class TimeHandler {
    constructor(uhg) {
        this.uhg = uhg;
        this.events = new Collection();
        this.ready = {}; 
    }

    async init() {
        const eventsPath = path.resolve(__dirname, 'events');
        if (!fs.existsSync(eventsPath)) return;

        const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
        
        for (const file of files) {
            const filePath = path.join(eventsPath, file);
            delete require.cache[require.resolve(filePath)];
            const pull = require(filePath);

            this.ready[pull.name] = true;

            if (this.uhg.config.time[pull.name] === undefined) {
                this.uhg.config.time[pull.name] = false;
                console.log(` [TIME] Nový event: ${pull.name}. Ukládám do configu...`.yellow);
            }

            // NASTAVENÍ CRONU S GLOBÁLNÍM TRY-CATCH
            pull.start = new cron.CronJob(pull.time, async () => {
                if (!this.ready[pull.name] || !this.uhg.config.time[pull.name]) return;
                
                // Spustíme unifikovanou exec metodu
                await this.executeEvent(pull);
            });

            if (pull.ignore) {
                pull.ignore?.split(" ").forEach((unit, i) => {
                    if (unit === "*") return;
                    unit.split(",").forEach(t => {
                        const dict = ["second", "minute", "hour", "dayOfMonth", "month", "dayOfWeek"][i];
                        if (pull.start.cronTime[dict]) delete pull.start.cronTime[dict][t];
                    });
                });
            }

            pull.start.start();
            this.events.set(pull.name, pull);
        }
        console.log(` [TIME] ${this.events.size} úkolů inicializováno.`.green);
    }

    /**
     * UNIFIKOVANÁ METODA PRO SPOUŠTĚNÍ
     * Zapouzdřuje logiku startu, běhu, chyb a konce.
     */
    async executeEvent(event) {
        this.eventStart(event);
        
        try {
            // Samotný běh kódu z event souboru
            await event.run(this.uhg);
        } catch (error) {
            // Pokud se cokoli pokazí, zalogujeme to centrálně
            this.logError(event, error);
        } finally {
            // Toto se provede VŽDY (i při chybě), takže se event nezasekne
            this.eventEnd(event);
        }
    }

    eventStart(event) {
        this.ready[event.name] = false;
        event.count = (event.count || 0) + 1;
        event.executedAt = new Date();
        if (!event.times) event.times = [];
        if (!event.errors) event.errors = [];
    }

    eventEnd(event) {
        this.ready[event.name] = true;
        const duration = new Date().getTime() - event.executedAt.getTime();
        event.lastTime = duration;
        event.times.push(duration);
        if (event.times.length > 50) event.times.shift();
        event.averageTime = event.times.reduce((a, b) => a + b, 0) / event.times.length;
    }

    logError(event, error) {
        console.error(` [TIME ERROR] ${event.name}:`.red, error);
        
        const timestamp = `<t:${Math.round(Date.now()/1000)}:R>`;
        event.errors.unshift({
            name: `${timestamp} Kritická chyba`,
            value: `\`\`\`js\n${error.message.slice(0, 100)}\`\`\``
        });
        if (event.errors.length > 5) event.errors.pop();
        
        const logChannel = this.uhg.dc.cache.channels.get('logs');
        if (logChannel) {
            logChannel.send(`⚠️ **Time Event [${event.name}] selhal:**\n> ${error.message}`);
        }
    }
}

module.exports = TimeHandler;