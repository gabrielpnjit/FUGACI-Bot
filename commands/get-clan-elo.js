const { SlashCommandBuilder } = require('discord.js');
const bhapi = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View ranked leaderboard of all FUGACI members by peak ELO!'),
    async execute(interaction) {
        await interaction.deferReply();
        const res = await bhapi.getClanElo();
        if (res) {
            console.log(res);
            interaction.editReply(JSON.stringify(res));
        } else {
            console.log('Error with getClanElo occurred');
            interaction.editReply('Unexpected Error!');
        }
    },
};