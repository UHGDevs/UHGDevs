

const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const fs = require('fs');
const path = require('node:path');


module.exports = {
    name: 'oznameni',
    description: 'Pošli oznámení na UHG dc!',
    permissions: [ {id: '378928808989949964', type: 'USER', permission: true }, { id: '660441379310272513', type: 'USER', permission: true}],
    options: [],
    type: 'modal',
    platform: 'discord',
    run: async (uhg, interaction) => {

  },
  add: async (uhg, interaction) => {
    
  }
}