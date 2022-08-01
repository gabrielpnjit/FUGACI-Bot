
const { SlashCommandBuilder } = require('discord.js');
const bhapi = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if bot is alive'),
    async execute(interaction) {
        const res = await bhapi.getClanElo();
        if (res) {
            console.log(res);
            await interaction.reply(JSON.stringify(res));
        }
    },
};