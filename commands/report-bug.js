const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bugreport')
        .setDescription('Report a Bug!'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('bugReport')
            .setTitle('Bug Report');
        const titleInput = new TextInputBuilder()
            .setCustomId('bugReportTitle')
            .setLabel('Subject')
            .setMaxLength(100)
            .setStyle(TextInputStyle.Short);
        const bodyInput = new TextInputBuilder()
            .setCustomId('bugReportBody')
            .setLabel('Please explain the bug')
            .setMaxLength(1000)
            .setStyle(TextInputStyle.Paragraph);
        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(bodyInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    },
};