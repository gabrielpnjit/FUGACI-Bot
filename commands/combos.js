const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combos')
        .setDescription('View a gif of a weapon\'s true combo'),
    async execute(interaction) {
        await interaction.deferReply();

        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('combos')
                    .setPlaceholder('Nothing selected')
                    .addOptions(
                        {
                            label: 'Option 1',
                            description: 'Description 1',
                            value: 'Value 1',
                        },
                        {
                            label: 'Option 2',
                            description: 'Description 2',
                            value: 'Value 2',
                        },
                    ),
            );
        await interaction.editReply({ content: 'Menu:', components: [row] });
    },
};