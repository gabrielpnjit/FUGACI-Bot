const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'tryoutOpen',
    },
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('tryoutSubmit')
            .setTitle('FUGACI Tryout Form');
        const nameInput = new TextInputBuilder()
            .setCustomId('tryoutIgn')
            .setLabel('In-Game Name')
            .setMaxLength(32)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const eloInput = new TextInputBuilder()
            .setCustomId('tryoutElo')
            .setLabel('Peak ELO')
            .setMaxLength(4)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const hourInput = new TextInputBuilder()
            .setCustomId('tryoutHours')
            .setLabel('Brawlhalla Playtime (Hours)')
            .setMaxLength(10)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const mainInput = new TextInputBuilder()
            .setCustomId('tryoutMain')
            .setLabel('Main Legend')
            .setMaxLength(32)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const regionInput = new TextInputBuilder()
            .setCustomId('tryoutRegion')
            .setLabel('Region (US-E or US-W)')
            .setMaxLength(8)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const dateInput = new TextInputBuilder()
            .setCustomId('tryoutDate')
            .setLabel('What date(s) and time(s) can you tryout?')
            .setMaxLength(32)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const bodyInput = new TextInputBuilder()
            .setCustomId('tryoutReason')
            .setLabel('Why would you like to tryout for FUGACI?')
            .setMaxLength(1000)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);
        const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(eloInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(regionInput);
        const fourthActionRow = new ActionRowBuilder().addComponents(hourInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(mainInput);
        // const sixthActionRow = new ActionRowBuilder().addComponents(dateInput);
        // const seventhActionRow = new ActionRowBuilder().addComponents(bodyInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

        await interaction.showModal(modal);
    },
};