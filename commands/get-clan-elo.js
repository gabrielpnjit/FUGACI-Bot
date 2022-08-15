const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const bhapi = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View ranked leaderboard of all FUGACI members by peak ELO!'),
        async execute(interaction) {
            await interaction.deferReply();

            const res = await bhapi.getClanElo();
            const diam = interaction.client.emojis.cache.get('1004897803937521684');
            const plat = interaction.client.emojis.cache.get('1004897802112995391');
            const gold = interaction.client.emojis.cache.get('1004897801353838632');
            const tin = interaction.client.emojis.cache.get('1004897800091336795');

            if (res) {
                let members = '';
                let elos = '';
                let count = 1;
                let rank;
                // this for block is for getting a string of members
                // and their elos from the getClanElo() returned data
                // these two strings, members and elos are passed into
                // two seprate fields in the embedbuilder as values
                for (let member in res) {
                    let elo = res[member];
                    if (elo >= 2000) {
                        rank = diam;
                    }
                    else if (elo >= 1680) {
                        rank = plat;
                    }
                    else if (elo >= 1390) {
                        rank = gold;
                    } else {
                        rank = tin;
                    }
                    members += `${rank} ${count}. ${member} \n`;
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
                    .setThumbnail('https://cdn.discordapp.com/attachments/689908352079495221/1007780011211767878/fugaci-removebg-preview1.png')
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
            else if (res == null) {
                interaction.editReply('API Request Limit Reached! Please try again in a few minutes!');
            }
            else {
                console.log('\x1b[31m', 'Error with getClanElo occurred');
                interaction.editReply('Unexpected Error!');
            }
        },
    };