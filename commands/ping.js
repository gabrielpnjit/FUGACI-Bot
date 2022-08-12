const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if bot is alive'),
    async execute(interaction) {
        const em = interaction.guild.emojis.cache.find(emoji => emoji.name === 'diamond');
        await interaction.reply(`${em} I am alive`);
    },
};