const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Submit a suggestion about how I can improve! Any recommendations are welcome!'),
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('suggestion')
            .setTitle('Suggestion');
        const titleInput = new TextInputBuilder()
            .setCustomId('suggestionTitle')
            .setLabel('Subject')
            .setMaxLength(100)
            .setStyle(TextInputStyle.Short);
        const bodyInput = new TextInputBuilder()
            .setCustomId('suggestionBody')
            .setLabel('Please explain your suggestion(s)!')
            .setMaxLength(1000)
            .setStyle(TextInputStyle.Paragraph);
        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(bodyInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    },
};