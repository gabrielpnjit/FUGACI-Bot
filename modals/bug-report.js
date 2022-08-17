module.exports = {
    data: {
        name: 'bugReport',
    },
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const user = await interaction.client.users.fetch('186980117820473344');
            const title = interaction.fields.getTextInputValue('bugReportTitle');
            const body = interaction.fields.getTextInputValue('bugReportBody');
            const author = interaction.user;
            user.send(`**Subject:**\n${title}\n**Issue**:\n${body}\n*Submitted by:* ${author}`);
            console.log('Bug Report was Submitted!');
            await interaction.editReply({ content: 'Successfully submitted bug report! Thank you!', ephemeral: true });
        }
        catch (error) {
            await interaction.editReply({ content: 'Error submitting bug report! Please try again!', ephemeral: true });
            console.log('Error with sending bug report:');
            console.log(error);
        }
    },
};