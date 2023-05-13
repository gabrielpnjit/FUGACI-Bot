module.exports = {
    data: {
        name: 'tryoutAccept',
    },
    async execute(interaction) {
        await interaction.deferReply();
        const ownerRole = interaction.message.guild.roles.cache.find(role => role.name === 'Clan Owner');
        const coOwnerRole = interaction.message.guild.roles.cache.find(role => role.name === 'Clan Co-Owner');
        const officerRole = interaction.message.guild.roles.cache.find(role => role.name === 'Officer');
        if (!(interaction.member.roles.cache.has(ownerRole.id) || interaction.member.roles.cache.has(coOwnerRole.id) || interaction.member.roles.cache.has(officerRole.id))) {
            await interaction.editReply({ content: 'You do not have permission to do that!', ephemeral: true });
            return;
        }
        await interaction.editReply({ content: 'Accepted Successfully!', ephemeral: true });
    },
};