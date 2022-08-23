const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Message } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll for members to vote on!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Question to ask!')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('Option 1')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Option 2')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Option 4')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Option 4')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option5')
                .setDescription('Option 5')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option6')
                .setDescription('Option 6')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option7')
                .setDescription('Option 8')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option8')
                .setDescription('Option 8')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option9')
                .setDescription('Option 9')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option10')
                .setDescription('Option 10')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option11')
                .setDescription('Option 11')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option12')
                .setDescription('Option 12')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        const author = interaction.user.tag;
        const avatarUrl = interaction.user.displayAvatarURL();
        const question = interaction.options.getString('question');
        const reactions = [
            '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱',
        ]

        let choices = [];
        for (let i = 1; i < 13; i++) {
            const option = interaction.options.getString(`option${i}`);
            if (option != null) {
                choices.push(option);
            }
        }
        console.log(choices);
        let choicesString = '';
        for (let i = 0; i < choices.length; i++) {
            choicesString += `${reactions[i]} ${choices[i]}\n`;
        }
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Poll')
        .setThumbnail('https://cdn.discordapp.com/attachments/756654864280453134/1011768783846781078/2696242-200.png')
        .setAuthor({ name: `${author}`, iconURL: avatarUrl })
        .addFields(
            { name: 'Poll Question', value: question },
            { name: 'Choices', value: choicesString },
        )
        .setTimestamp();

        const message = await interaction.editReply({ embeds: [embed] });

        try {
            for (let i = 0; i < choices.length; i++) {
                await message.react(reactions[i]);
            }
		}
        catch (error) {
			console.error('One of the emojis failed to react:', error);
		}
    },
};