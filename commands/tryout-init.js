const { SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tryoutinit')
        .setDescription('Check if bot is alive')
        .addStringOption(option =>
            option.setName('channelid')
                .setDescription('Enter Channel ID to send tryout message to')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const channelId = await interaction.options.getString('channelid');
        const channel = await interaction.client.channels.cache.get(channelId);

        const embed = new EmbedBuilder()
        .setTitle('FUGACI Clan Tryouts')
        .setColor('#FF5F1F')
        .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1132466915550437476/FUGACI_2.png')
        .addFields(
            { name: '<:FUGACI_2:1132465986390474762> Requirements', value: '> • 2200+ Peak ELO\n> • 500+ in-game Brawlhalla hours\n> • US-E or US-W\n> • Active and Non-toxic' },
            { name: '<:FUGACI_2:1132465986390474762> What we offer', value: '> • CBs\n> • Active high-level players\n> • Active and supportive community\n> • In-clan tournaments with prize pools\n> • In-clan giveaways' },
            { name: '<:FUGACI_2:1132465986390474762> How to join', value: '> Just click on the "**TRYOUT**" button\n> below and submit the form!\n> If you meet the requirements, we\'ll\n> contact you and schedule a BO5 tryout.\n> We\'ll get back to you as soon as possible!\n> Good luck and thank you for trying out!' },
        );

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tryoutOpen')
                .setLabel('TRYOUT')
                .setEmoji('<:HattoriRead:1132466481838428241>')
                .setStyle(ButtonStyle.Success),
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply('Tryout message sent!');
    },
};