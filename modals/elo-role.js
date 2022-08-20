const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'eloRole',
    },
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const channel = await interaction.client.channels.cache.get('1010626707880935484');
            const name = interaction.fields.getTextInputValue('eloName');
            const elo = interaction.fields.getTextInputValue('eloClaim');
            const image = interaction.fields.getTextInputValue('eloImage');
            const author = interaction.user.tag;
            const avatarUrl = interaction.user.displayAvatarURL();
            const guild = interaction.guild;
            const iconUrl = interaction.guild.iconURL();

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('eloReject')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('eloAccept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
            );

            const embed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setTitle('Elo Request')
                .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1010632673926058104/Logo_BrawlhallaHammer.png')
                .setAuthor({ name: `${author}`, iconURL: avatarUrl })
                .addFields(
                    { name: 'Name', value: name },
                    { name: 'Elo Claim', value: elo },
                    { name: 'Image', value: image },
                )
                .setImage(image)
                .setFooter({ text: `Discord Server: ${guild}`, iconURL: iconUrl })
                .setTimestamp();

            await channel.send({ embeds: [embed], components: [row]});
            console.log('Elo Request was successfully submitted!');
            await interaction.editReply({ content: 'Successfully submitted elo role request! A moderator will review your request shortly. Thank you!', ephemeral: true });
        }
        catch (error) {
            await interaction.editReply({ content: 'Invalid image URL! Please try again!', ephemeral: true });
            console.log('Error with sending elo role request:');
            console.log(error);
        }
    },
};