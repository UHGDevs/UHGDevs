const axios = require('axios');
const path = require('path');
const fs = require('fs');
const ApiFunctions = require('../ApiFunctions');

module.exports = {
    getProfiles: async (uhg, uuid, key, achievements = null) => {
        // Pokud nemáme achievementy (např. voláme jen !sb), zkusíme je rychle stáhnout
        // Achievementy jsou klíčové pro výpočet skillů, pokud má hráč vypnuté API
        if (!achievements) {
            try {
                const pRes = await axios.get(`https://api.hypixel.net/player`, { params: { key, uuid } });
                if (pRes.data.player) achievements = pRes.data.player.achievements;
            } catch (e) { /* Ignorovat, skilly budou méně přesné */ }
        }

        const res = await axios.get(`https://api.hypixel.net/v2/skyblock/profiles`, { params: { key, uuid } });
        if (!res.data.success || !res.data.profiles) return { profiles: [] };

        const profiles = [];
        const parserPath = path.resolve(__dirname, '../skyblock/player.js');
        const playerParser = require(parserPath);

        for (const p of res.data.profiles) {
            // Přeskočíme profily, kde hráč není (což by se nemělo stát, ale pro jistotu)
            const rawMember = p.members[uuid];
            if (!rawMember) continue;

            // Základní info o profilu
            let profileObj = {
                id: p.profile_id,
                name: p.cute_name,
                mode: ApiFunctions.getSbMode(p.game_mode),
                selected: p.selected || false,
                last_save: p.last_save || 0,
                // Banka je sdílená pro profil
                bank: p.banking ? Math.floor(p.banking.balance) : 0,
                community_upgrades: p.community_upgrades || {}
            };

            // Parsování člena (Zde se děje magie)
            // Předáváme 'achievements' jako extra kontext
            try {
                profileObj.member = playerParser(rawMember, profileObj, { achievements: achievements || {} });
            } catch (e) {
                console.error(` [SB ERROR] Parser selhal u profilu ${p.cute_name}:`.red, e);
                profileObj.member = {}; // Fallback
            }

            profiles.push(profileObj);
        }

        // Seřadit: Vybraný první, pak podle data uložení
        profiles.sort((a, b) => (b.selected - a.selected) || (b.last_save - a.last_save));

        return { profiles };
    }
};