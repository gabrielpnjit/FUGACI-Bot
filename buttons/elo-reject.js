
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'eloReject',
    },
    async execute(interaction) {
        await interaction.deferReply();
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('eloReject')
                .setLabel('Rejected')
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger),
        );
        const reply = await interaction.fetchReply();
        const id = reply.reference.messageId;
        const message = await interaction.message.fetch(`${id}`);
        await message.edit({ components: [row] });
        await interaction.deleteReply();
        console.log('Elo Request successfully rejected!');
    },
};