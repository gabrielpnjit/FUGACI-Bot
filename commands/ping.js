const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if bot is alive'),
    async execute(interaction) {
        const em = interaction.guild.emojis.cache.find(emoji => emoji.name === 'diamond');
        const button = new ButtonBuilder()
            .setCustomId('sub-yt')
            .setLabel('Click Me!')
            .setStyle(ButtonStyle.Primary);

        await interaction.reply({
            content:`${em} I am alive`,
            components: [new ActionRowBuilder().addComponents(button)]
        });
    },
};