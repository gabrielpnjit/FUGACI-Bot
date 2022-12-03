const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'combos',
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        const combo = interaction.values[0];
        console.log(`${combo}`);
    },
};