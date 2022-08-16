module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interaction.isButton()) {
            const { customId } = interaction;
            const button = interaction.client.buttons.get(customId);
            if (!button) {
                console.log('button does not exist');
                return;
            }
            try {
                await button.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
            }
        } else {
            return;
        }
    },
};