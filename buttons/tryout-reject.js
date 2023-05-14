const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'tryoutReject',
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const ownerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Clan Owner');
        const coOwnerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Clan Co-Owner');
        const officerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Officer');

        // Allow only officers, owners, and coowners to run these buttons
        if (!(interaction.member.roles.cache.has(ownerRole.id) || interaction.member.roles.cache.has(coOwnerRole.id) || interaction.member.roles.cache.has(officerRole.id))) {
            await interaction.editReply({ content: 'You do not have permission to do that!', ephemeral: true });
            return;
        }

        const rejectRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('eloReject')
                .setLabel('Rejected')
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger),
        );

        const reply = await interaction.fetchReply();
        const id = reply.reference.messageId;
        const message = await interaction.message.fetch(`${id}`);
        const userId = message.embeds[0].data.footer.text.slice(9);

        await message.edit({ components: [rejectRow] });
        await interaction.client.users.send(userId, 'Your tryout for FUGACI has been rejected.');
        await interaction.editReply({ content: 'Rejected Successfully!', ephemeral: true });
    },
};