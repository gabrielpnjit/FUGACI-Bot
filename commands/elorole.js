const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('elorole')
        .setDescription('Send a request to update peak elo role! A'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('eloRole')
            .setTitle('Update Peak Elo Role!');
        const nameInput = new TextInputBuilder()
            .setCustomId('eloName')
            .setLabel('In-Game Name')
            .setMaxLength(32)
            .setStyle(TextInputStyle.Short);
        const eloInput = new TextInputBuilder()
            .setCustomId('eloClaim')
            .setLabel('Peak Elo')
            .setMaxLength(4)
            .setStyle(TextInputStyle.Short);
        const eloImage = new TextInputBuilder()
            .setCustomId('eloImage')
            .setLabel('Image URL of Elo')
            .setMaxLength(1000)
            .setStyle(TextInputStyle.Short);
        const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(eloInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(eloImage);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);
    },
};