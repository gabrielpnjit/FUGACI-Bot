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
                    .setCustomId('weapons')
                    .setPlaceholder('Weapons')
                    .addOptions(
                        {
                            label: 'Sword',
                            value: 'sword',
                        },
                        {
                            label: 'Spear',
                            value: 'spear',
                        },
                    ),
            );
        await interaction.editReply({ content: '**Select a weapon**:', components: [row] });
    },
};