const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: 'eloAccept',
    },
    async execute(interaction) {
        try {
            await interaction.message.guild.roles.fetch();

            await interaction.deferReply();
            const reply = await interaction.fetchReply();
            const id = reply.reference.messageId;
            const message = await interaction.message.fetch(`${id}`);
            const eloClaimVal = message.embeds[0].data.fields[1].value;

            if (parseInt(eloClaimVal) >= 2000) {
                const acceptRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('eloAccepted')
                        .setLabel('Accepted')
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Success),
                );
                const eloRole = eloClaimVal.slice(0, 2) + '00+';
                const eloClaim = interaction.message.guild.roles.cache.find(role => role.name === eloRole);
                const userId = interaction.client.users.cache.find(u => u.tag === `${message.embeds[0].data.author.name}`).id;
                const member = await interaction.guild.members.fetch(userId);
                for (let i = 2000; i < 3100; i += 100) {
                    if (member.roles.cache.find(r => r.name === `${i}+`)) {
                        await member.roles.remove(interaction.message.guild.roles.cache.find(r => r.name === `${i}+`));
                        console.log(`Successfully removed ${i}+ role`);
                    }
                }
                member.roles.add(eloClaim);
                await interaction.deleteReply();
                await message.edit({ components: [acceptRow] });
                console.log('Elo Request successfully accepted!');
            }
            else {
                console.log('Elo Value out of range');
                const errorRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('eloError')
                        .setLabel('Elo out of range')
                        .setDisabled(true)
                        .setStyle(ButtonStyle.Danger),
                );
                await interaction.deleteReply();
                await message.edit({ components: [errorRow] });
                console.log('Elo Request Error!');
            }
        }
        catch (error) {
            console.log('Elo Request Error!');
            console.log(error);
            await interaction.editReply('Unexpected Error!');
        }
    },
};