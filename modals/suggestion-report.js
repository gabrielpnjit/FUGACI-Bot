module.exports = {
    data: {
        name: 'suggestion',
    },
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const user = await interaction.client.users.fetch('186980117820473344');
            const title = interaction.fields.getTextInputValue('suggestionTitle');
            const body = interaction.fields.getTextInputValue('suggestionBody');
            const author = interaction.user;
            user.send(`**Subject:**\n${title}\n**Suggestion**:\n${body}\n*Submitted by:* ${author}`);
            console.log('Suggestion was Submitted!');
            await interaction.editReply({ content: 'Successfully submitted suggestion! Thank you!', ephemeral: true });
        }
        catch (error) {
            await interaction.editReply({ content: 'Error submitting suggestion! Please try again!', ephemeral: true });
            console.log('Error with sending suggestiont:');
            console.log(error);
        }
    },
};