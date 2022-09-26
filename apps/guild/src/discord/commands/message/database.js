module.exports = {
    name: "database",
    aliases: [],
    permissions: [{ id: '312861502073995265', type: 'USER', permission: true }, { id: '378928808989949964', type: 'USER', permission: true }, { id: '419183469911080960', type: 'USER', permission: true }],
    platform: "dc",
    type: "message",
    run: async (uhg, message, content) => {
        console.warn('not done yet!')
        message.delete()
    }
}
