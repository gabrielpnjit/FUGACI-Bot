const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Change the status of FUGACI Bot!')
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('Type of activity for status!')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: '0' },
                    { name: 'Listening to', value: '2' },
                    { name: 'Watching', value: '3' },
                    { name: 'Competing in', value: '5' },
                ))
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Name of activity for status!')
                .setMaxLength(128)
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        if (interaction.member.roles.cache.some(role => role.name === 'Member')) {
            const activity = parseInt(interaction.options.getString('activity'));
            const status = interaction.options.getString('status');
            let activityString = '';
            await interaction.client.user.setActivity(status, { type: activity });
            switch (activity) {
                case 0:
                    activityString = 'Playing';
                    break;
                case 2:
                    activityString = 'Listening to';
                    break;
                case 3:
                    activityString = 'Watching';
                    break;
                case 5:
                    activityString = 'Competing in';
                    break;
                default:
                    console.log('Error: Invalid activity');
            }
            await interaction.editReply(`Changed FUGACI Bot status to: "${activityString} **${status}**"`);
        }
        else {
            await interaction.editReply('You do not have permission to do this!');
        }
    },
};