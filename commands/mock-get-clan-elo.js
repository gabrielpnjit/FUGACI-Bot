const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const bhapi = require('../functions.js');
const pages = [];
function getRow(currPage) {
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
            .setDisabled(currPage == pages.length)
            .setStyle(ButtonStyle.Primary),
    );
    return row;
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('mockleaderboard')
        .setDescription('View mock ranked leaderboard of all FUGACI members by peak ELO!'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const res = await bhapi.mockGetClanMembers();
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
                        pageCount++;
                    }
                    members += str;
                    if (elo != -1) {
                        elos += member.peak_rating + '\n';
                        count++;
                    }
                    else {
                        elos += 'N/A \n';
                    }
                }
                const averageElo = Math.round(sum / memberCount);
                console.log(averageElo);
                console.log(totalWins);
                console.log(totalLosses);
                pagesMembers.push(members);
                pagesElos.push(elos);
                for (let i = 0; i < pagesMembers.length; i++) {
                    pages.push(new EmbedBuilder()
                    .setTitle('FUGACI 1v1 Ranked Leaderboard')
                    .setColor(0x18e1ee)
                    .setThumbnail('https://cdn.discordapp.com/attachments/689908352079495221/1007780011211767878/fugaci-removebg-preview1.png')
                    .setTimestamp(Date.now())
                    .setURL('http://corehalla.com/stats/clan/682808')
                    .setFooter({ text: `Page ${i + 1} of ${pagesMembers.length}` })
                    .setDescription(`**W/L:** ${totalWins}/${totalLosses} • **Average Elo:** ${averageElo}`)
                    .addFields(
                        { name: 'Member', value: pagesMembers[i], inline: true },
                        { name: 'Elo', value: pagesElos[i], inline: true },

                    ));
                }
                let currPage = 1;
                let row = getRow(currPage);
                interaction.editReply({
                    embeds: [pages[0]],
                    components: [row],
                });

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
                            components: [getRow(currPage)],
                        });
                    }
                    else if (btnInt.customId === 'prev' && currPage > 1) {
                        currPage--;
                        interaction.editReply({
                            embeds: [pages[currPage - 1]],
                            components: [getRow(currPage)],
                        });
                    }
                    else {
                        return;
                    }
                });
                collector.on('end', collected => {
                    console.log(`Collected ${collected.size} items`);
                    console.log('Collector Ended');
                    interaction.editReply({
                        components: [],
                    });
                });
            }
            else {
                console.log('\x1b[31m', 'Error with getClanElo occurred');
                interaction.editReply('Unexpected Error!');
            }
        }
        catch (error) {
            console.log('Error with mock leaderboard:');
            console.log(error);
        }
    },
};