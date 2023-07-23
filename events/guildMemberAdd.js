const { EmbedBuilder } = require('discord.js');

function getOrdinal(n) {
    let ord = 'th';
    if (n % 10 == 1 && n % 100 != 11) {
      ord = 'st';
    }
    else if (n % 10 == 2 && n % 100 != 12) {
      ord = 'nd';
    }
    else if (n % 10 == 3 && n % 100 != 13) {
      ord = 'rd';
    }
    return ord;
  }

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        const { user, guild } = member;
        const welcomeChannel = member.guild.channels.cache.get('990457831843070065');
        const rulesChannel = member.guild.channels.cache.get('990462977595547648').toString();
        const tryoutsChannel = member.guild.channels.cache.get('1107191813342773340').toString();
        // const rolesChannel = member.guild.channels.cache.get('990467417052430366').toString();
        const rolesChannel = '<id:customize>';

        const welcomeEmbed = new EmbedBuilder()
        .setTitle(`Welcome to FUGACI!`)
        .setAuthor({ name: `${user.tag}`, iconURL: `${user.displayAvatarURL()}` })
        .setDescription(`Hello ${member}!\nYou are our ${guild.memberCount}${getOrdinal(guild.memberCount)} Member!\n╔════════════╗\nMake sure to check out:\n${rulesChannel}\n${tryoutsChannel}\n${rolesChannel}\n╚════════════╝`)
        .setColor('#E78230')
        // .setFooter({ text: `Member #${guild.memberCount}` })
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1132462647909036112/HATTORI_Maitre_dHattori_Coat_of_Lions_Emote_See_Ya_5_250x311.png');
        welcomeChannel.send({
            embeds: [welcomeEmbed],
        });
    },
};