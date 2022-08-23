const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'suggestion',
    },
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            // const user = await interaction.client.users.fetch('186980117820473344');
            const channel = await interaction.client.channels.cache.get('1011762901972963519');
            const title = interaction.fields.getTextInputValue('suggestionTitle');
            const body = interaction.fields.getTextInputValue('suggestionBody');
            const author = interaction.user.tag;
            const avatarUrl = interaction.user.displayAvatarURL();
            const guild = interaction.guild;
            const iconUrl = interaction.guild.iconURL();

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Suggestion')
                .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1009919775272603779/26-265685_green-exclamation-point-circle.png')
                .setAuthor({ name: `${author}`, iconURL: avatarUrl })
                .addFields(
                    { name: 'Subject', value: title },
                    { name: 'Suggestion', value: body },
                )
                .setFooter({ text: `Discord Server: ${guild}`, iconURL: iconUrl })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            console.log('Suggestion was Submitted!');
            await interaction.editReply({ content: 'Successfully submitted suggestion! Thank you!', ephemeral: true });
        }
        catch (error) {
            await interaction.editReply({ content: 'Error submitting suggestion! Please try again!', ephemeral: true });
            console.log('Error with sending suggestiont:');
            console.log(error);
        }
    },
};