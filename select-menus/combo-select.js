const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'combos',
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        const combo = interaction.values[0];
        if (combo == 'swordCombo1') {
            const embed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setTitle('Sword \n*dlight > jump > sair*')
                .setThumbnail('https://cdn.discordapp.com/attachments/1010626707880935484/1013166302636015656/Sword_Icon.png')
                .addFields(
                    { name: 'Dex Requirement:', value: 'None' },
                    { name: 'Health Requirement:', value: 'None' },
                )
                .setImage('https://cdn.discordapp.com/attachments/757943446806855822/757944525992755271/dlightsair.gif')
            await interaction.editReply({ content: '', embeds: [embed], components: [] });
        }
        else if (combo == 'swordCombo2') {
            await interaction.editReply({ content: 'dlight > recovery\nhttps://cdn.discordapp.com/attachments/757943446806855822/757945324986957824/dlightrec.gif', components: [] });
        }
    },
};