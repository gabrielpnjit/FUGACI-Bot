const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'createTryoutChannel',
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const ownerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Clan Owner');
        const coOwnerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Clan Co-Owner');
        const officerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Officer');
        const memberRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Member');

        // Allow only officers, owners, and coowners to run these buttons
        if (!(interaction.member.roles.cache.has(ownerRole.id) || interaction.member.roles.cache.has(coOwnerRole.id) || interaction.member.roles.cache.has(officerRole.id))) {
            await interaction.editReply({ content: 'You do not have permission to do that!', ephemeral: true });
            return;
        }
        const reply = await interaction.fetchReply();
        const id = reply.reference.messageId;
        const message = await interaction.message.fetch(`${id}`);
        const userId = message.embeds[0].data.footer.text.slice(9);
        const member = await interaction.message.guild.members.fetch(userId);
        const memberTag = interaction.message.embeds[0].data.author.name;
        const categoryId = '1107188012481265714';
        const category = await interaction.message.guild.channels.cache.get(categoryId);
        const channelName = 'Tryouts ' + memberTag;

        const tryoutIgn = message.embeds[0].data.fields[0].value;
        const tryoutElo = message.embeds[0].data.fields[1].value;
        const tryoutHours = message.embeds[0].data.fields[3].value;
        const tryoutRegion = message.embeds[0].data.fields[4].value;
        const tryoutMain = message.embeds[0].data.fields[6].value;

        await interaction.message.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: ownerRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: coOwnerRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: officerRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: memberRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: userId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
            ],
        })
            .then(async channel => {
                // Create embed that includes delete channel button
                const embed = new EmbedBuilder()
                .setTitle('Tryout Channel - ' + memberTag)
                .setColor('#FF5F1F')
                // .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1011768783846781078/2696242-200.png')
                .setDescription('**Thank you for trying out!**\n> This channel is for discussing anything related to tryouts including BO5 scheduling and any questions or concerns!')
                .addFields(
                    { name: 'IGN:', value: tryoutIgn, inline: true },
                    { name: 'Peak ELO:', value: tryoutElo, inline: true },
                    { name: 'Playtime (Hours):', value: tryoutHours, inline: true },
                    { name: 'Region:', value: tryoutRegion, inline: true },
                    { name: 'Main Legend:', value: tryoutMain, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                );

                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('deleteTryoutChannel')
                        .setLabel('Delete Channel')
                        .setStyle(ButtonStyle.Danger),
                );

                await channel.send({ embeds: [embed], components: [row]});
                await interaction.editReply('Successfully created tryout channel for ' + memberTag + '!');
            })
            .catch(async error => {
                console.error(error);
                await interaction.editReply('Failed to create tryout channel');

            });
    },
};