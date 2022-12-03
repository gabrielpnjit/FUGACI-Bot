const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combos')
        .setDescription('View a gif of a weapon\'s true combo'),
    async execute(interaction) {
        await interaction.deferReply();
        const weapons = ['Hammer', 'Sword', 'Blasters', 'Lance', 'Spear', 'Katars', 'Axe', 'Bow', 'Gauntlets', 'Scythe', 'Cannon', 'Orb', 'Greatsword'];
        const selectWeapons = new SelectMenuBuilder()
            .setCustomId('weapons')
            .setPlaceholder('Weapons');
        for (let i = 0; i < weapons.length; i++) {
            selectWeapons.addOptions(
                {
                    label: weapons[i],
                    value: weapons[i].toLowerCase(),
                },
            );
        }
        const row = new ActionRowBuilder().addComponents(selectWeapons);
        await interaction.editReply({ content: '**Select a weapon**:', components: [row] });
    },
};