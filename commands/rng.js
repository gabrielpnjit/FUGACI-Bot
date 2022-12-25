const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rng')
        .setDescription('Generate random number from "min" to "max" inclusive!')
        .addStringOption(option =>
            option.setName('min')
                .setDescription('Minimum number (inclusive)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('max')
                .setDescription('Maximum number (inclusive)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const min = interaction.options.getString('min');
        const max = interaction.options.getString('max');

        const embed = new EmbedBuilder()
        .setTitle(':game_die: Random Number Generator :game_die:')
        .addFields(
            { name: `Minimum: ${min} \t\t\t Maximum: ${max}`, value: `Random Number is: __**${randomNumber(min, max)}**__!`, inline: false },
        )
        .setColor('#FF0000')

    await interaction.editReply({ embeds: [embed] });
    },
};