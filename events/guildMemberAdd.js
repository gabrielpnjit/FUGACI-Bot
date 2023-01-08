const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        const { user, guild } = member;
        const welcomeChannel = member.guild.channels.cache.get('756654864280453134');
        const rulesChannel = member.guild.channels.cache.get('1061369986884583446').toString();
        const tryoutsChannel = member.guild.channels.cache.get('1061370040408096822').toString();
        const rolesChannel = member.guild.channels.cache.get('1061370081491292310').toString();

        const welcomeEmbed = new EmbedBuilder()
        .setTitle(`Welcome to FUGACI!`)
        .setAuthor({ name: `${user.tag}`, iconURL: `${user.displayAvatarURL()}` })
        .setDescription(`╔════════════╗\nMake sure to check out:\n${rulesChannel}\n${tryoutsChannel}\n${rolesChannel}\n╚════════════╝`)
        // .addFields(
        //     { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
        // )
        .setColor('#228C22')
        .setThumbnail(`https://cdn.discordapp.com/attachments/689908352079495221/1061365775492976741/EMBER_Fangwilds_Heart_Ember_Classic_Colors_Emote_See_Ya_5_242x350.png`)
        welcomeChannel.send({
            content: `Hello ${member}!`,
            embeds: [welcomeEmbed],
        });
    },
};