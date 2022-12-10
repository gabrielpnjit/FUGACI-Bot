const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();
const BHKEY = process.env.BH_KEY;
const axios = require('axios');
const helpers = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('elo')
        .setDescription('Check your ranked elo')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('Enter user ID of player!')
                .setRequired(true)),
    async execute(interaction) {
        let userId = interaction.options.getString('userid');
        await interaction.deferReply();
        const req = `https://api.brawlhalla.com/player/${userId}/ranked/?api_key=${BHKEY}`;
        await axios.get(req)
        .then(async result => {
            const playerData = result.data;
            // console.log(playerData);
            const name = playerData.name;
            const currElo = playerData.rating;
            const peakElo = playerData.peak_rating;
            const tier = playerData.tier;
            const wins = playerData.wins;
            const games = playerData.games;
            const losses = games - wins
            const region = playerData.region;
            const regionRank = playerData.region_rank;
            const globalRank = playerData.global_rank;
            let legendsArr = playerData.legends;
            legendsArr = helpers.sortByKeyAsc(legendsArr, 'rating');
            let bestLegendName = legendsArr[0].legend_name_key;

            bestLegendName = bestLegendName.split(' ')  // this is to title case the legend name
            .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
            .join(' ');

            const bestLegendCurrRating = legendsArr[0].rating;
            const bestLegendPeakRating = legendsArr[0].peak_rating;

            const diam = interaction.client.emojis.cache.get('1004897803937521684');
            const plat = interaction.client.emojis.cache.get('1004897802112995391');
            const gold = interaction.client.emojis.cache.get('1004897801353838632');
            const tin = interaction.client.emojis.cache.get('1004897800091336795');
            const wEmoji = interaction.client.emojis.cache.get('1048708106877685820');
            const lEmoji = interaction.client.emojis.cache.get('1048708091224522853');
            const hattoriPlaceHolder = interaction.client.emojis.cache.get('1048726709396054046');

            const embed = new EmbedBuilder()
            // .setAuthor({ name: name, iconURL: 'https://i.imgur.com/AfFp7pu.png'})
            .setTitle(`1v1 Ranked - ${name}`)
            .setURL(`https://corehalla.com/stats/player/${userId}`)
            .setThumbnail('https://static.wikia.nocookie.net/brawlhalla_gamepedia/images/4/46/Banner_Rank_Diamond.png/revision/latest?cb=20161110140154')
            .setColor('#5A32B2 ')
            .setDescription(`${diam} **${tier}**: ${currElo} / ${peakElo} (${wins} W - ${losses} L)\n${hattoriPlaceHolder} **Best Legend**: ${bestLegendName} ${bestLegendCurrRating} / ${bestLegendPeakRating}\n:flag_us: **${region}**: ${regionRank}  :earth_americas: **Global**: ${globalRank}`);

            await interaction.editReply({ embeds: [embed] });
        })
        .catch(async error => {
            console.log(error);
            await interaction.editReply(`Error getting elo for ${userId}`);
        });
    },
};