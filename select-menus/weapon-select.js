const { ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'weapons',
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        const weapon = interaction.values[0];
        if (weapon == 'sword') {
            const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('combos')
                    .setPlaceholder('Sword True Combos')
                    .addOptions(
                        {
                            label: 'dlight > jump > sair',
                            value: 'swordCombo1',
                        },
                        {
                            label: 'dlight > jump > recovery',
                            value: 'swordCombo2',
                        },
                    ),
            );
            await interaction.editReply({ content: '**Select a combo:**', components: [row] });
        }
        else if (weapon == 'spear') {
            const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('combos')
                    .setPlaceholder('Spear True Combos')
                    .addOptions(
                        {
                            label: 'sair > nlight',
                            value: 'spearCombo1',
                        },
                        {
                            label: 'dlight > jump > nair',
                            value: 'spearCombo2',
                        },
                    ),
            );
            await interaction.editReply({ content: '**Select a combo:**', components: [row] });
        }
    },
};