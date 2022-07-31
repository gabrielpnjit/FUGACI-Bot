// using discord js v14! most current tutorials are v13 so be wary
require('dotenv').config();
const bhapi = require('./functions.js');
const TOKEN = process.env.DISC_TOKEN;
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    // eslint-disable-next-line comma-dangle
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    if (commandName === 'leaderboard') {
        const res = await bhapi.getClanElo();
        if (res) {
            console.log(res);
            await interaction.reply(JSON.stringify(res));
        }
    }
});

client.login(TOKEN);