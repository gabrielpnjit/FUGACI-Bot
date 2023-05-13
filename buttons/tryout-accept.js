const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'tryoutAccept',
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

        const acceptRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tryoutAccepted')
                .setLabel('Accepted')
                .setDisabled(true)
                .setStyle(ButtonStyle.Success),
        );

        const reply = await interaction.fetchReply();
        const id = reply.reference.messageId;
        const message = await interaction.message.fetch(`${id}`);
        const userId = message.embeds[0].data.footer.text.slice(9);
        const member = await interaction.message.guild.members.fetch(userId);

        await member.roles.add(memberRole);
        await message.edit({ components: [acceptRow] });
        await interaction.client.users.send(userId, 'Your tryout for FUGACI has been accepted!');
        await interaction.editReply({ content: 'Accepted Successfully!', ephemeral: true });
    },
};