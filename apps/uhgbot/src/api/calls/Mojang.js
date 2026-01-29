const axios = require('axios');

module.exports = async (input, cache) => {
    const cacheKey = `mojang_${input.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
        // Ashcon API je spolehlivější než čistý Mojang pro UUID/Jména
        const res = await axios.get(`https://api.ashcon.app/mojang/v2/user/${input}`);
        const data = {
            success: true,
            uuid: res.data.uuid.replace(/-/g, ""),
            username: res.data.username,
            usernameHistory: res.data.username_history,
            created_at: new Date(res.data.created_at),
            textures: res.data.textures
        };

        // Uložíme do cache na 1 hodinu (identita se nemění často)
        cache.set(cacheKey, data, 3600);
        
        // Cache i pod druhým klíčem (pokud jsme hledali podle jména, uložíme i pod UUID a naopak)
        cache.set(`mojang_${data.uuid}`, data, 3600);
        cache.set(`mojang_${data.username.toLowerCase()}`, data, 3600);

        return data;
    } catch (e) {
        return { success: false, reason: "Hráč nenalezen (Mojang API)" };
    }
};