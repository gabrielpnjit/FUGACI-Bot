const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildBanAdd',
    execute(ban) {
        const { user } = ban;
        const welcomeChannel = ban.guild.channels.cache.get('990457831843070065');

        const welcomeEmbed = new EmbedBuilder()
        .setTitle(`${ban.user}! has been banned from FUGACI!`)
        .setAuthor({ name: `${user.tag}`, iconURL: `${user.displayAvatarURL()}` })
        .setDescription('It\'s sad to see you go like this...')
        .setColor('#FF0000')
        // .setFooter({ text: `Member #${guild.memberCount}` })
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/1009920873303638118/1141872383158923264/HATTORI_Maitre_dHattori_Coat_of_Lions_Emote_Noble_End_31_451x289.png');
        welcomeChannel.send({
            embeds: [welcomeEmbed],
        });
    },
};