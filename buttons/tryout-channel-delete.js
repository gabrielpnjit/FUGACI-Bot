const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'deleteTryoutChannel',
    },
    async execute(interaction) {
        await interaction.deferReply();
        const ownerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Clan Owner');
        const coOwnerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Clan Co-Owner');
        const officerRole = await interaction.message.guild.roles.cache.find(role => role.name === 'Officer');

        // Allow only officers, owners, and coowners to run these buttons
        if (!(interaction.member.roles.cache.has(ownerRole.id) || interaction.member.roles.cache.has(coOwnerRole.id) || interaction.member.roles.cache.has(officerRole.id))) {
            await interaction.editReply({ content: 'You do not have permission to do that!', ephemeral: true });
            return;
        }

        // Create embedded message with button to confirm deletion
        // Create embed that includes delete channel button
        const embed = new EmbedBuilder()
        .setTitle('Are you sure you want to delete this channel?')
        .setColor('#FF5F1F');

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('cancelDeleteTryout')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('confirmDeleteTryout')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success),
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};