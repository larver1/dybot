const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('../config.json');

let args = process.argv.slice(2);
let commandId = args[0];

// Deletes a command from Discord's client for all users
// Once done, they won't be able to use the command until it is deployed again
// The command file itself will still be intact, just not accessible
const rest = new REST({ version: '9' }).setToken(token);
rest.delete(Routes.applicationCommand(clientId, commandId))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);