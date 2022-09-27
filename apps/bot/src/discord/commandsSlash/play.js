const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const fs = require('fs');

module.exports = {
  name: 'play',
  description: 'Přehraj hudbu!',
  permissions: [ {id: '572651929625296916', type: 'ROLE', permission: true, guild: '455751845319802880' }],
  options: [
    {
      name: 'file',
      description: 'Jaký soubor?',
      type: 'ATTACHMENT',
      required: false
    },
    // {
    //   name: 'url',
    //   description: 'Jaká url?',
    //   type: 'STRING',
    //   required: false
    // }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: true })
    try {

      if (!interaction.member.voice?.channel) return interaction.editReply({ content: 'Nejsi ve voicu!', ephemeral: true })

      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      })

    const player = createAudioPlayer()
    let file = interaction.options.getAttachment('file')
    if (file && !file?.name.endsWith('.mp3')) return interaction.editReply({ content: 'Soubor není MP3', ephemeral: true })
    if (!file) file = interaction.options.getString('url')
    if (!file) return interaction.editReply({ content: 'Nezadal jsi URL', ephemeral: true })


    //const resource = createAudioResource('music/Endless Praise.mp3')
    let resource;
    try {
      resource = file.url ? createAudioResource(file.url) : ytdl(file, { filter: 'audioonly'})
    } catch (e) {
      console.log(e)
      return interaction.editReply({ content: 'Neplatné URL!', ephemeral: true })}

    connection.subscribe(player)

    //console.log(resource)

    player.play(resource)

      await interaction.editReply({ content: 'Playing', ephemeral: true })
    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'PLAY Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v PLAY slash commandu!"
    }
  }
}
