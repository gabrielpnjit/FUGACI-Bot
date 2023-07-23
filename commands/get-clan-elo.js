const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const bhapi = require('../functions.js');
function getRow(currPage, pagesArray) {
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Prev')
            .setDisabled(currPage == 1)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setDisabled(currPage == pagesArray.length)
            .setStyle(ButtonStyle.Primary),
    );
    return row;
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View ranked leaderboard of all FUGACI members by peak ELO!')
        .addStringOption(option =>
            option.setName('clanid')
                .setDescription('Enter clan ID of another specific clan!')
                .setRequired(false)),

        async execute(interaction) {
            await interaction.deferReply();
            // FUGACI clan id = 682808
            let option = interaction.options.getString('clanid');
            let res;
            console.log(option);
            if (option != null) {
                res = await bhapi.getClanMembers(option);
            }
            else {
                option = '682808';
                res = await bhapi.getClanMembers('682808');
            }
            const pages = [];
            const diam = interaction.client.emojis.cache.get('1004897803937521684');
            const plat = interaction.client.emojis.cache.get('1004897802112995391');
            const gold = interaction.client.emojis.cache.get('1004897801353838632');
            const tin = interaction.client.emojis.cache.get('1004897800091336795');

            if (res) {
                let pagesMembers = [];
                let pagesElos = [];
                let pageCount = 0;
                let members = '';
                let elos = '';
                let count = 1;
                let rank;
                let sum = 0;
                let memberCount = 0;
                let totalWins = 0;
                let totalLosses = 0;
                const clanName = res[0];
                res = res[1];
                // these two strings, members and elos are passed into
                // two seprate fields in the embedbuilder as values
                for (let i in res) {
                    let member = res[i];
                    let elo = member.peak_rating;
                    if (elo >= 2000) {
                        rank = diam;
                        sum += elo;
                        totalWins += member.wins;
                        totalLosses += (member.games - member.wins);
                        memberCount++;
                    }
                    else if (elo >= 1680) {
                        rank = plat;
                        sum += elo;
                        totalWins += member.wins;
                        totalLosses += (member.games - member.wins);
                        memberCount++;
                    }
                    else if (elo >= 1390) {
                        rank = gold;
                        sum += elo;
                        totalWins += member.wins;
                        totalLosses += (member.games - member.wins);
                        memberCount++;
                    } else {
                        rank = tin;
                    }
                    let str = `${rank} ${count}. ${member.name} \n`;
                    let temp = members;
                    temp += str;
                    if (temp.length > 1024) {
                        pagesMembers.push(members);
                        pagesElos.push(elos);
                        members = '';
                        elos = '';
                    }
                    members += str;
                    if (elo != -1) {
                        elos += elo + '\n';
                        count++;
                    }
                    else {
                        elos += 'N/A \n';
                    }
                }
                const averageElo = Math.round(sum / memberCount);
                pagesMembers.push(members);
                pagesElos.push(elos);
                for (let i = 0; i < pagesMembers.length; i++) {
                    pages.push(new EmbedBuilder()
                    .setTitle(`${clanName} 1v1 Ranked Leaderboard`)
                    .setColor('#FF5F1F')
                    .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1132466915550437476/FUGACI_2.png')
                    .setTimestamp(Date.now())
                    .setURL(`http://corehalla.com/stats/clan/${option}`)
                    .setFooter({ text: `Page ${i + 1} of ${pagesMembers.length}` })
                    .setDescription(`**W/L:** ${totalWins}/${totalLosses} • **Average Elo:** ${averageElo}`)
                    .addFields(
                        { name: 'Member', value: pagesMembers[i], inline: true },
                        { name: 'Elo', value: pagesElos[i], inline: true },

                    ));
                }
                let currPage = 1;
                let row = getRow(currPage, pages);
                interaction.editReply({
                    embeds: [pages[0]],
                    components: [row],
                });

                // you must use a message collector to make sure the collector only collects stuff for its own interaction
                const message = await interaction.fetchReply();
                let filter;
                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', (btnInt) => {
                    if (!btnInt) {
                        return;
                    }

                    btnInt.deferUpdate();

                    if (btnInt.customId === 'next' && currPage < pages.length) {
                        currPage++;
                        interaction.editReply({
                            embeds: [pages[currPage - 1]],
                            components: [getRow(currPage, pages)],
                        });
                    }
                    else if (btnInt.customId === 'prev' && currPage > 1) {
                        currPage--;
                        interaction.editReply({
                            embeds: [pages[currPage - 1]],
                            components: [getRow(currPage, pages)],
                        });
                    }
                    else {
                        return;
                    }
                    collector.on('end', collected => {
                        console.log(`Collected ${collected.size} items`);
                        console.log('Collector Ended');
                        interaction.editReply({
                            components: [],
                        });
                    });
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