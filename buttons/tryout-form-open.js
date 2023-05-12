const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'tryoutOpen',
    },
    async execute(interaction) {
        await interaction.reply('clicked');
    },
};