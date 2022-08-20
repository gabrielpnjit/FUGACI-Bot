const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('elorole')
        .setDescription('Send a request to update peak elo role! A'),
    async execute(interaction) {
        await interaction.reply('Send a request to update your peak elo role!');
    },
};