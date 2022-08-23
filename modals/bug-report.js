const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'bugReport',
    },
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            // const user = await interaction.client.users.fetch('186980117820473344');
            const channel = await interaction.client.channels.cache.get('1011763238679101460');
            const title = interaction.fields.getTextInputValue('bugReportTitle');
            const body = interaction.fields.getTextInputValue('bugReportBody');
            const author = interaction.user.tag;
            const avatarUrl = interaction.user.displayAvatarURL();
            const guild = interaction.guild;
            const iconUrl = interaction.guild.iconURL();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Bug Report')
                .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1009913768865705984/1303037.png')
                .setAuthor({ name: `${author}`, iconURL: avatarUrl })
                .addFields(
                    { name: 'Subject', value: title },
                    { name: 'Issue', value: body },
                )
                .setFooter({ text: `Discord Server: ${guild}`, iconURL: iconUrl })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            console.log('Bug Report was Submitted!');
            await interaction.editReply({ content: 'Successfully submitted bug report! Thank you!', ephemeral: true });
        }
        catch (error) {
            await interaction.editReply({ content: 'Error submitting bug report! Please try again!', ephemeral: true });
            console.log('Error with sending bug report:');
            console.log(error);
        }
    },
};