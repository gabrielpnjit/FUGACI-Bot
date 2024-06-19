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
            option.setName('gamemode')
                .setDescription('Ranked 1v1 or 2v2 Leaderboard?')
                .setRequired(true)
                .addChoices(
                    { name: '1v1', value: '1v1' },
                    { name: '2v2', value: '2v2' },
                    // { name: 'Rotating', value: 'rotating' }, // TODO: add rotating
                ))
        .addStringOption(option =>
            option.setName('clanid')
                .setDescription('Enter clan ID of another specific clan!')
                .setRequired(false)),

        async execute(interaction) {
            await interaction.deferReply();
            // FUGACI clan id = 682808
            let clanId = interaction.options.getString('clanid');
            const gamemode = interaction.options.getString('gamemode');
            let res;
            console.log(clanId);
            if (clanId != null) {
                res = await bhapi.getClanMembers(clanId);
            }
            else {
                clanId = '682808';
                res = await bhapi.getClanMembers('682808');
            }
            const pages = [];
            const val = interaction.client.emojis.cache.get('1249882046357176385');
            const diam = interaction.client.emojis.cache.get('1004897803937521684');
            const plat = interaction.client.emojis.cache.get('1004897802112995391');
            const gold = interaction.client.emojis.cache.get('1004897801353838632');
            const tin = interaction.client.emojis.cache.get('1004897800091336795');

            let valhallanCutoff = 3000;

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
                let clanMembers = {};
                if (gamemode == "1v1") {
                    valhallanCutoff = await bhapi.getValhallanElo1v1("us-e");
                    valhallanCutoff = valhallanCutoff.eloCutoff;
                    clanMembers = res[1];
                }
                else if (gamemode == "2v2") {
                    valhallanCutoff = await bhapi.getValhallanElo2v2("us-e");
                    valhallanCutoff = valhallanCutoff.eloCutoff;
                    clanMembers = bhapi.get2sTeams(res[1]);
                }
                // else { // rotating
                //     valhallanCutoff = 10000;
                //     console.log("rotating gamemode...")
                // }
                // these two strings, members and elos are passed into
                // two seprate fields in the embedbuilder as values
                for (let i in clanMembers) {
                    let member = clanMembers[i];
                    let elo = member.peak_rating;
                    if (elo >= valhallanCutoff && member.wins >= 100) {
                        rank = val;
                        sum += elo;
                        totalWins += member.wins;
                        totalLosses += (member.games - member.wins);
                        memberCount++;
                    }
                    else if (elo >= 2000) {
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
                    let str = `${rank} ${count}. ${gamemode == "1v1" ? member.name.replace(/[^\x00-\x7F]/g, "") : member.teamname.replace(/[^\x00-\x7F]/g, "")} \n`;
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
                    .setTitle(`${clanName} ${gamemode == "1v1" ? "1v1" : "2v2"} Ranked Leaderboard`)
                    .setColor('#E78230')
                    .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1132466915550437476/FUGACI_2.png')
                    .setTimestamp(Date.now())
                    .setURL(`http://corehalla.com/stats/clan/${clanId}`)
                    .setFooter({ text: `Page ${i + 1} of ${pagesMembers.length}` })
                    .setDescription(`**W/L:** ${totalWins}/${totalLosses} • **Average Elo:** ${averageElo}`)
                    .addFields(
                        { name: `${gamemode == "1v1" ? "Member" : "Team"}`, value: pagesMembers[i], inline: true },
                        { name: 'Peak Elo', value: pagesElos[i], inline: true },

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