const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        .setName('leaderboard')
        .setDescription('View ranked leaderboard of all FUGACI members by peak ELO!'),
        async execute(interaction) {
            await interaction.deferReply();
            // FUGACI clan id = 682808
            const res = await bhapi.getClanElo('682808');
            const diam = interaction.client.emojis.cache.get('1004897803937521684');
            const plat = interaction.client.emojis.cache.get('1004897802112995391');
            const gold = interaction.client.emojis.cache.get('1004897801353838632');
            const tin = interaction.client.emojis.cache.get('1004897800091336795');

            if (res) {
                let pagesMembers = [];
                let pagesElos = [];
                let members = '';
                let elos = '';
                let count = 1;
                let rank;
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
                    let str = `${rank} ${count}. ${member} \n`;
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
                        elos += res[member] + '\n';
                        count++;
                    }
                    else {
                        elos += 'N/A \n';
                    }
                }
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
                let filter;
                const time = 1000 * 60 * 5;
                let collector = interaction.channel.createMessageComponentCollector({ filter, time });

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