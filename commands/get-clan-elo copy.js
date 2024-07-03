const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const bhapi = require('../functions.js');

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

            const val = interaction.client.emojis.cache.get('1249882046357176385');
            const diam = interaction.client.emojis.cache.get('1004897803937521684');
            const plat = interaction.client.emojis.cache.get('1004897802112995391');
            const gold = interaction.client.emojis.cache.get('1004897801353838632');
            const tin = interaction.client.emojis.cache.get('1004897800091336795');

            if (res) {
                const embed = new EmbedBuilder()
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
                    )

                interaction.editReply({ embeds: [pages] });
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