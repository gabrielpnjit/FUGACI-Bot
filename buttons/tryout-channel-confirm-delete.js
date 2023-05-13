const { ChannelType } = require('discord.js');

module.exports = {
    data: {
        name: 'confirmDeleteTryout',
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

        await interaction.editReply('Deleting channel...');
        await interaction.channel.delete();
    },
};