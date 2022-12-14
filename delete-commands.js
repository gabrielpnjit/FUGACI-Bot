require('dotenv').config();
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const CLIENTID = process.env.CLIENT_ID;
const GUILDID = process.env.GUILD_ID;
const TOKEN = process.env.DISC_TOKEN;

const rest = new REST({ version: '10' }).setToken(TOKEN);

// for guild-based commands, replace third parameter with command id and run this to delete command
// rest.delete(Routes.applicationGuildCommand(CLIENTID, GUILDID, '1003140620262580295'))
// 	.then(() => console.log('Successfully deleted guild command'))
// 	.catch(console.error);

// delete all commands:
// for guild-based commands
rest.put(Routes.applicationGuildCommands(CLIENTID, GUILDID), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands
// rest.put(Routes.applicationCommands(CLIENTID), { body: [] })
// 	.then(() => console.log('Successfully deleted all application commands.'))
// 	.catch(console.error);