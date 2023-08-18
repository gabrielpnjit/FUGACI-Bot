const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    execute(member) {
        const { user } = member;
        const welcomeChannel = member.guild.channels.cache.get('990457831843070065');

        const welcomeEmbed = new EmbedBuilder()
        .setTitle('Farewell from FUGACI!')
        .setAuthor({ name: `${user.tag}`, iconURL: `${user.displayAvatarURL()}` })
        .setDescription(`We hope you enjoyed your stay ${member}!`)
        .setColor('#FF4F4B')
        // .setFooter({ text: `Member #${guild.memberCount}` })
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/1009920873303638118/1141864561331425401/HATTORI_Maitre_dHattori_Coat_of_Lions_Emote_Brawlhalla_Salute_21_192x325.png');
        welcomeChannel.send({
            embeds: [welcomeEmbed],
        });
    },
};