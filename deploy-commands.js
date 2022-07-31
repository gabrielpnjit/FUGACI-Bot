// run this only when commands are edited or added
require('dotenv').config();
const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const CLIENTID = process.env.CLIENT_ID;
const GUILDID = process.env.GUILD_ID;
const TOKEN = process.env.DISC_TOKEN;

const commands = [
	new SlashCommandBuilder().setName('leaderboard').setDescription('View ranked leaderboard of all FUGACI members by peak ELO!'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENTID, GUILDID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);