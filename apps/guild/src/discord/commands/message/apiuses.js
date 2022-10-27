
module.exports = {
    name: "database",
    aliases: ['api', 'uses'],
    permissions: [{ id: '312861502073995265', type: 'USER', permission: true }, { id: '378928808989949964', type: 'USER', permission: true }, { id: '419183469911080960', type: 'USER', permission: true }],
    platform: "dc",
    type: "message",
    run: async (uhg, message, content) => {
        //let api = await uhg.getApi("f50e5d5cca524c2ebc9d040acefa7c5a", ["key"])
        return 'Chybí key endpoint v api'
    }
}
