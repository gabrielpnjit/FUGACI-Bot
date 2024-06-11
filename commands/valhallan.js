const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { getValhallanElo1v1, getValhallanElo2v2, getNextValhallanReset } = require('../functions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('valhallan')
        .setDescription('Check what elo is needed for Valhallan in 1s (US-E)!'),

    async execute(interaction) {
        await interaction.deferReply();

        const valhallanEmoji = interaction.client.emojis.cache.get('1249882046357176385');
        const eloOnes = await getValhallanElo1v1();
        const eloTwos = await getValhallanElo2v2();
        const resetTime = getNextValhallanReset();
        const seasonEndTime = "1719997200";
        const valhallanStartTime = "1713362400";
        const currTimestamp = Math.floor(Date.now() / 1000);
        const embed = new EmbedBuilder()
        .setTitle(`${valhallanEmoji} Valhallan Elo US-E ${valhallanEmoji}`)
        .addFields(
            { name: `1v1 Elo Cutoff`, value: `${eloOnes}`, inline: true },
            { name: `2v2 Elo Cutoff`, value: `${eloTwos}`, inline: true },
            { name: `Rank Cutoff`, value: `Top 150`, inline: true },
            { name: `Valhallan Reset`, value: `<t:${resetTime}:R>`, inline: true },
            { name: `Season Ends`, value: `≈ <t:${seasonEndTime}:R>`, inline: true },
            { name: `Valhallan Unlock${currTimestamp > valhallanStartTime ? 'ed': 's'}`, value: `<t:${valhallanStartTime}:R>`, inline: true },
        )
        .setColor('#c7ebc8')
        .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1249972675355611196/Banner_Rank_Valhallan.webp?ex=66693f45&is=6667edc5&hm=14c3c6078788a2a7551a4156b52266ab5a8ef8fa145c0034300d61bdc6dce2c5&')
        .setURL(`https://www.brawlhalla.com/rankings/game/us-e/1v1/6?sortBy=rank`)

        await interaction.editReply({ embeds: [embed] });
    },
};