# UHG Bot v5.0.0

Komplexní bot pro propojení Minecraftu (Hypixel) a Discordu, vyvinutý pro guildu UHG. Bot poskytuje integraci s Hypixel API, správu guildy, statistiky hráčů a automatizaci procesů.

## 🏗️ Architektura systému

Bot je postaven na modulární architektuře s centrálním koordinátorem `Uhg.js`.

### Hlavní moduly:
- **Discord (`src/discord`)**: Správa interakcí na Discordu pomocí `discord.js`. Podporuje klasické i Slash příkazy.
- **Minecraft (`src/minecraft`)**: Mineflayer bot, který se připojuje přímo na Hypixel. Slouží jako bridge mezi herním chatem a Discordem.
- **API (`src/api`)**: Vrstva pro komunikaci s Hypixel, Mojang a SkyBlock API. Obsahuje pokročilou cache a zpracování dat.
- **Time (`src/time`)**: Plánovač úloh (Cron), který spouští periodické kontroly (achievementy, databáze, elite role).
- **Utils (`src/utils`)**: Pomocné třídy pro databázi, leaderboardy, badge a správu rolí.

---

## 🚀 Instalace a spuštění

### Požadavky:
- Node.js (v18+)
- MongoDB (lokální nebo Atlas)
- Minecraft účet (Microsoft auth)
- Discord Bot Token a Hypixel API Key

### Kroky:
1. Nainstaluj moduly: `npm install`
2. Nastav tokeny `.env` (viz níže).
3. Spusť bota: `npm start`

---

## ⚙️ Konfigurace

### 1. Soubor `.env`
Vytvoř v kořenu složky `apps/uhgbot` soubor `.env`:
```env
token=VAŠ_DISCORD_TOKEN
api_key=VAŠ_HYPIXEL_API_KEY
mongo=MONGODB_URI
email=MINECRAFT_EMAIL
```

### 2. Soubor `config.json`
Tento soubor se automaticky vytvoří při prvním spuštění s výchozími hodnotami. Obsahuje ID serverů, kanálů a nastavení chování bota. Bot podporuje **Hot-Reload** konfigurace (změny v souboru se projeví okamžitě bez restartu).

---

## 📂 Detailní struktura složek

### `src/api`
- `calls/`: Jednotlivé API endpointy (Hypixel, Mojang, SkyBlock).
- `constants/`: Statická data (seznamy předmětů, achievementů, mapy leaderboardů).
- `games/`: Logika pro výpočet statistik jednotlivých miniher.
- `Api.js`: Hlavní entrypoint pro API s inteligentní cache.

### `src/discord`
- `commands/`: Klasické textové příkazy (např. `.gaccept`).
- `commandsSlash/`: Moderní Discord Slash příkazy.
- `events/`: Handlery pro Discord události (ready, message, interaction).
- `handler.js`: Rozcestník pro příchozí interakce.

### `src/minecraft`
- `commands/`: Příkazy proveditelné přímo z Minecraft chatu (např. `!bw`).
- `Minecraft.js`: Inicializace Mineflayer bota a správa připojení.
- `bridge.js`: Logika pro přeposílání zpráv mezi MC a Discordem.
- `handler.js`: Zpracování příchozích zpráv z herního chatu.

### `src/time`
- `events/`: Skripty spouštěné v pravidelných intervalech (aktualizace databáze, kontrola fór, správa rolí).
- `TimeHandler.js`: Inicializace Cron úloh.

---

## 💾 Databáze (MongoDB)

Bot využívá MongoDB pro ukládání dat o hráčích, guildách a nastaveních. Hlavní databáze je pojmenována `data`.

### Kolekce `users` (Struktura dat)
Tato kolekce obsahuje sjednocená data o hráčích. Zde je příklad základního rozložení dat (na základě profilu `DavidCzPdy`):

```json
{
  "_id": "f50e5d5cca524c2ebc9d040acefa7c5a", // UUID hráče bez pomlček
  "username": "DavidCzPdy",
  "uuid": "f50e5d5cca524c2ebc9d040acefa7c5a",
  "discordId": "1466082546587799645", // ID verifikovaného Discord účtu
  "updated": 1770234900538, // Timestamp poslední aktualizace
  "created_at": "2018-01-09T00:00:00.000Z", // Datum vytvoření Minecraft účtu
  "guilds": [ // POKUD JE V UHG / TKJK
    {
      "name": "UltimateHypixelGuild",
      "active": true,
      "rank": "Guild General",
      "joined": 1595265772589,
      "exp": { "2026-02-04": 7130, ... } // Historie GEXP po dnech
    }
  ],
  "stats": { // POKUD SE TRACKUJ
    "updated": 1770219326187,
    "general": {
      "level": 242.96,
      "karma": 58371745,
      "aps": 9425,
      ...
    },
    "bedwars": { ... }, 
    "skywars": { ... },
    "arena": { ... },
    ...
  },
  "cakes": { ... }, // POKUD SE TRACKUJÍ
  "garden": { ... } // POKUD SE TRACKUJE
}
```

### 🛠️ Práce s databází

Bot používá oficiální [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/). Operace jsou rozděleny na **vlastní pomocné metody** (v `Database.js`) a **nativní volání driveru**.

#### 1. Vlastní wrapper metody (`uhg.db`)
Tyto funkce zjednodušují časté úkony a integrují caching:
- **`getUser(id)`**: "Chytré" vyhledávání. Automaticky zkusí najít hráče podle UUID, Discord ID nebo **case-insensitive** jména. Výsledek ukládá do cache pod všemi těmito klíči.
- **`getVerify(id)`**: Nejlehčí metoda, vrací pouze propojení (UUID <-> DiscordID <-> Username).
- **`saveUser(uuid, data)`**: Aktualizuje dokument uživatele a přidá timestamp `updated`.
- **`getOnlineMembers(guildName)`**: Vyhledá všechny aktivní členy guildy pomocí operátoru `$elemMatch`.

#### 2. Nativní MongoDB metody
Pro složitější operace se přistupuje přímo k driveru přes `uhg.db.db.collection(name)`:
- **`findOne(query, options)`**: Vrátí první dokument odpovídající filtru.
- **`find(query).toArray()`**: Vrátí pole všech odpovídajících dokumentů.
- **`updateOne(query, update, options)`**: Upraví dokument. Často se používá s operátorem `{ upsert: true }`.
- **`bulkWrite(operations)`**: Hromadné zpracování tisíců změn v jednom požadavku (používá se při synchronizaci guildy).

### 🔍 Pokročilé techniky

#### Upsert (Update or Insert)
Při volání `updateOne` s parametrem `{ upsert: true }` se MongoDB zachová inteligentně:
- Pokud dokument odpovídající filtru **existuje**, provede se **update**.
- Pokud dokument **neexistuje**, automaticky se **vytvoří nový** s daty z query a update části.
*Použití:* Ideální pro synchronizaci hráčů, kde nemusíme řešit, zda už v DB jsou.

#### Projekce (Projection)
Slouží k omezení polí, která se stahují z databáze. Šetří přenos dat a RAM.
- `1` = Chci toto pole zahrnout.
- `0` = Chci toto pole vyloučit.
*Příklad:* `{ username: 1, stats: 1, _id: 0 }` vrátí pouze jméno a statistiky.

#### Operátor `$elemMatch`
Používá se pro prohledávání polí s objekty (např. pole `guilds`). Umožňuje definovat více kritérií, která musí splňovat **tentýž** prvek pole.
*Příklad:* Hledání člena, který je v guildě "UHG" a zároveň je tam aktivní.

#### Operátor `$unset`
Slouží k úplnému odstranění pole z dokumentu (např. při `unverify` smazání pole `discordId`).

#### Chytré vyhledávání (Regex & OR)
V metodě `getUser` se používá kombinace operátoru `$or` a regulárních výrazů:
```javascript
{
  $or: [
    { _id: id }, // Přesná shoda UUID
    { discordId: id }, // Přesná shoda Discord ID
    { username: { $regex: new RegExp(`^${id}$`, 'i') } } // Case-insensitive jméno
  ]
}
```

#### Caching
Bot využívá `node-cache` k minimalizaci dotazů na Oracle hosting. 
- **Users Cache**: Drží kompletní dokumenty 5 minut.
- **Guilds Cache**: Drží data o guildách 30 minut.
- Jakákoliv změna přes `saveUser` nebo `updateVerify` automaticky zneplatní (smaže) daný záznam v cache, aby se při dalším dotazu načetla aktuální data.

---

## 🛠️ Vývojové funkce

- **Hot-Reload**: Většina modulů (příkazy, handlery) se načítá dynamicky. Změny v kódu lze aplikovat bez restartu celého bota.
- **Dev Mode**: V `config.json` lze zapnout `dev_mode`, který přepne bota na testovací kanály a servery.
- **Error Handling**: Globální zachytávání výjimek zabraňuje pádům při neočekávaných chybách API.

## 📝 Aktuální stav (Todo)
- [ ] Implementace chybějících sb statistik spolu s API.
- [ ] Oprava Dropper a dalších statistik.
- [ ] Rozšíření SkyBlock příkazů o podrobnější Discord embedy.
