const { ActionRowBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'weapons',
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        const weapon = interaction.values[0];
        switch (weapon) {
            case 'hammer': {
                const combos = [
                    {
                        'combo': 'dlight > jump > sair',
                        'dex': '0',
                        'hp': '0',
                    },
                    {
                        'combo': 'dlight > jump > cd > recovery',
                        'dex': '0',
                        'hp': '0',
                    },
                    {
                        'combo': 'dlight > slight',
                        'dex': '0',
                        'hp': '0',
                    },
                ];
                const selectCombos = new SelectMenuBuilder()
                    .setCustomId('combos')
                    .setPlaceholder('Hammer Combos');
                for (let i = 0; i < combos.length; i++) {
                    selectCombos.addOptions(
                        {
                            label: combos[i].combo,
                            value: `${JSON.stringify(combos[i])}`,
                        },
                    );
                }
                const row = new ActionRowBuilder().addComponents(selectCombos);
                await interaction.editReply({ content: '**Select a combo:**', components: [row] });
                break;
            }
            case 'sword':
                console.log('picked sword');
                break;
            case 'blasters':
                console.log('picked blasters');
                break;
            case 'lance':
                console.log('picked lance');
                break;
            case 'spear':
                console.log('picked spear');
                break;
            case 'katars':
                console.log('picked katars');
                break;
            case 'axe':
                console.log('picked axe');
                break;
            case 'bow':
                console.log('picked bow');
                break;
            case 'gauntlets':
                console.log('picked gauntlets');
                break;
            case 'scythe':
                console.log('picked scythe');
                break;
            case 'cannon':
                console.log('picked cannon');
                break;
            case 'orb':
                console.log('picked orb');
                break;
            case 'greatsword':
                console.log('picked greatsword');
                break;
        }
    },
};