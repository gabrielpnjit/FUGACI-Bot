const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getValhallanElo1v1, getValhallanElo2v2, getNextValhallanReset } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('valhallan')
        .setDescription('Check what elo is needed for Valhallan in 1s (US-E)!')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Select region to check Valhallan details for')
                .setRequired(true)
                .addChoices(
                    { name: 'US-E', value: 'us-e' },
                    { name: 'US-W', value: 'us-w' },
                    { name: 'EU', value: 'eu' },
                    { name: 'BRZ', value: 'brz' },
                    { name: 'SEA', value: 'sea' },
                    { name: 'AUS', value: 'aus' },
                    { name: 'JPN', value: 'jpn' },
                    { name: 'ME', value: 'me' },
                    { name: 'SAF', value: 'sa' },
                )),

    async execute(interaction) {
        await interaction.deferReply();

        const region = interaction.options.getString('region');
        console.log(interaction.options)
        const valhallanEmoji = interaction.client.emojis.cache.get('1249882046357176385');
        const eloOnes = await getValhallanElo1v1(region);
        const eloTwos = await getValhallanElo2v2(region);
        const resetTime = getNextValhallanReset();
        const seasonEndTime = "1719997200";
        const valhallanStartTime = "1713362400";
        const currTimestamp = Math.floor(Date.now() / 1000);
        const embed = new EmbedBuilder()
        .setTitle(`${valhallanEmoji} Valhallan Elo ${(region == "sa" ? "SAF" : region).toUpperCase()} ${valhallanEmoji}`)
        .addFields(
            { name: `1v1 Elo Cutoff`, value: `[${eloOnes.eloCutoff}](https://www.brawlhalla.com/rankings/game/${region}/1v1/${eloOnes.page}?sortBy=rank)`, inline: true },
            { name: `2v2 Elo Cutoff`, value: `[${eloTwos.eloCutoff}](https://www.brawlhalla.com/rankings/game/${region}/2v2/${eloTwos.page}?sortBy=rank)`, inline: true },
            { name: `Rank Cutoff`, value: `Top ${eloOnes.cutoff}`, inline: true },
            { name: `Valhallan Reset`, value: `<t:${resetTime}:R>`, inline: true },
            { name: `Season Ends`, value: `≈ <t:${seasonEndTime}:R>`, inline: true },
            { name: `Valhallan Unlock${currTimestamp > valhallanStartTime ? 'ed': 's'}`, value: `<t:${valhallanStartTime}:R>`, inline: true },
        )
        .setColor('#c7ebc8')
        .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1249972675355611196/Banner_Rank_Valhallan.webp?ex=66693f45&is=6667edc5&hm=14c3c6078788a2a7551a4156b52266ab5a8ef8fa145c0034300d61bdc6dce2c5&')
        .setURL(`https://www.brawlhalla.com/rankings/game/${region}/1v1/${eloOnes.page}?sortBy=rank`)

        await interaction.editReply({ embeds: [embed] });
    },
};