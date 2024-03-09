// using discord js v14! most current tutorials are v13 so be wary
require('dotenv').config();
const { updateClanData } = require('./functions.js');
const fs = require('node:fs');
const path = require('node:path');
const TOKEN = process.env.DISC_TOKEN;
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
    ],
});

// command handling stuff
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// button handling stuff
client.buttons = new Collection();
const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    client.buttons.set(button.data.name, button);
}

// modal handling stuff
client.modals = new Collection();
const modalsPath = path.join(__dirname, 'modals');
const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

for (const file of modalFiles) {
    const filePath = path.join(modalsPath, file);
    const modal = require(filePath);
    client.modals.set(modal.data.name, modal);
}

// event handling stuff
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute (...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// discord api error handling
process.on('unhandledRejection', async (err) => {
    console.error('Unhandled Promise Rejection:\n', err);
  });
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Promise Exception:\n', err);
  });
process.on('uncaughtExceptionMonitor', async (err) => {
    console.error('Uncaught Promise Exception (Monitor):\n', err);
  });
// process.on('multipleResolves', async (type, promise, reason) => {
//     console.error('Multiple Resolves:\n', type, promise, reason);
//   });

// interval testing

setInterval(() => updateClanData(682808), 10000);
// login/start bot
client.login(TOKEN);