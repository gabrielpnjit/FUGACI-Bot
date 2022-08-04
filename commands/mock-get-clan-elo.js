const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const bhapi = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mockleaderboard')
        .setDescription('View mock ranked leaderboard of all FUGACI members by peak ELO!'),
    async execute(interaction) {
        await interaction.deferReply();
        const res = await bhapi.mockGetClanElo();

        if (res) {
            let members = '';
            let elos = '';
            let count = 1;
            for (let member in res) {
                let elo = res[member];
                members += `${count}. ${member} \n`;
                if (elo != -1) {
                    elos += res[member] + '\n';
                    count++;
                }
                else {
                    elos += 'N/A \n';
                }
            }
            const embed = new EmbedBuilder()
                .setTitle('FUGACI 1v1 Ranked Leaderboard')
                // .setDescription('This is a desription')
                .setColor(0x18e1ee)
                // .setImage(client.user.displayAvatarURL())
                .setTimestamp(Date.now())
                // .setFooter({
                //     iconURL: client.user.displayAvatarURL(),
                //     text: client.user.tag,
                // })
                .setURL('http://corehalla.com/stats/clan/682808')
                .addFields(
                    { name: 'Member', value: members, inline: true },
                    { name: 'Elo', value: elos, inline: true },

                );
            interaction.editReply({
                embeds: [embed],
            });
        }
        else {
            console.log('Error with getClanElo occurred');
            interaction.editReply('Unexpected Error!');
        }
    },
};