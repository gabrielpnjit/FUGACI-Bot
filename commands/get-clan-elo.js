const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const bhapi = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View ranked leaderboard of all FUGACI members by peak ELO!'),
        async execute(interaction) {
            await interaction.deferReply();
            const res = await bhapi.getClanElo();
            if (res) {
                let members = '';
                let elos = '';
                let count = 1;
                // this for block is for getting a string of members
                // and their elos from the getClanElo() returned data
                // these two strings, members and elos are passed into
                // two seprate fields in the embedbuilder as values
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
                // console.log(members);
                // console.log(elos);
                // create embedded message
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
            } else {
                console.log('Error with getClanElo occurred');
                interaction.editReply('Unexpected Error!');
            }
        },
    };