const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'tryoutSubmit',
    },
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const channel = await interaction.client.channels.cache.get('1107187526923456553');
            const userId = interaction.user.id;
            const tryoutIgn = interaction.fields.getTextInputValue('tryoutIgn');
            const tryoutElo = interaction.fields.getTextInputValue('tryoutElo');
            const tryoutHours = interaction.fields.getTextInputValue('tryoutHours');
            const tryoutMain = interaction.fields.getTextInputValue('tryoutMain');
            // const tryoutReason = interaction.fields.getTextInputValue('tryoutReason');
            const tryoutRegion = interaction.fields.getTextInputValue('tryoutRegion');
            const author = interaction.user.tag;
            const avatarUrl = interaction.user.displayAvatarURL();
            // const guild = interaction.guild;
            // const iconUrl = interaction.guild.iconURL();

            const embed = new EmbedBuilder()
                .setColor('#FF5F1F')
                .setTitle('__FUGACI Tryout Request__')
                // .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1009913768865705984/1303037.png')
                .setAuthor({ name: `${author}`, iconURL: avatarUrl })
                .addFields(
                    { name: 'IGN:', value: tryoutIgn, inline: true },
                    { name: 'Peak ELO:', value: tryoutElo, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: 'Playtime (Hours):', value: tryoutHours, inline: true },
                    { name: 'Region:', value: tryoutRegion, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: 'Main Legend:', value: tryoutMain },
                )
                .setFooter({ text: `User ID: ${userId}` })
                .setTimestamp();

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tryoutReject')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('tryoutAccept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('createTryoutChannel')
                    .setLabel('Open Channel')
                    .setStyle(ButtonStyle.Primary),
            );

            await channel.send({ embeds: [embed], components: [row]});
            console.log('Tryout was submitted!');
            await interaction.editReply({ content: 'Successfully submitted tryout form! We\'ll contact you as soon as possible!', ephemeral: true });
        }
        catch (error) {
            await interaction.editReply({ content: 'Error submitting tryout form! Please try again!', ephemeral: true });
            console.log('Error with sending tryout request:');
            console.log(error);
        }
    },
};