const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    execute(oldMember, newMember) {
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const boostCount = newMember.guild.premiumSubscriptionCount;
        let boosterFlag = false;

        if (addedRoles.size > 0) {
            addedRoles.forEach(role => {
                if (role.id == '990466322674614273') {
                    boosterFlag = true;
                }
            });
        }

        if (boosterFlag) {
            const { user } = newMember;
            const welcomeChannel = oldMember.guild.channels.cache.get('756654864280453134');

            const welcomeEmbed = new EmbedBuilder()
            .setTitle(`FUGACI has been boosted to ${boostCount} boosts!`)
            .setAuthor({ name: `${user.tag}`, iconURL: `${user.displayAvatarURL()}` })
            .setDescription(`Thank you for boosting FUGACI ${user}!`)
            .setColor('#f47fff')
            .setTimestamp()
            .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1141915242637574204/hattoriboost.png');
            welcomeChannel.send({
                embeds: [welcomeEmbed],
            });
        }
        else {
            return;
        }
    },
};