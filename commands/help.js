const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('See list of all commands and their descriptions!'),
    async execute(interaction) {
        await interaction.deferReply();

        const embed = new EmbedBuilder()
        .setTitle('Slash Commands:')
        .setColor('#228B22')
        .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1011792285186404392/Question-mark-PNG-Photos.png')
        .addFields(
            { name: '/leaderboard', value: 'Get an updated peak elo leaderboard of all FUGACI members for the current season!\nSearch up other using their clan ID as an argument!' },
            { name: '/elorole', value: 'Update your peak elo role! (Will be confirmed by a moderator)' },
            { name: '/poll', value: 'Create an embedded poll of up to 12 options!' },
            { name: '/suggestion', value: 'Suggest any new features or any kind of feedback!' },
            { name: '/bugreport', value: 'Report any bugs!' },
            { name: '/help', value: 'List all available slash commands!' },
            { name: '/ping', value: 'Check if I am alive!' },
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    },
};