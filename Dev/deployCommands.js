const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('../config.json');

const commands = [];

// Gets all the folders
const commandFolder = fs.readdirSync('./Commands', { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

// Adds all the commands from the sub-folders
for (const folder of commandFolder){
	const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter(file => file.endsWith('.js'));

	// Get every user command to deploy to all servers
	for (const file of commandFiles) {
		const command = require(`../Commands/${folder}/${file}`);
		if(command.section != "Admin") {
			commands.push(command.data.toJSON());
			console.log(command.data.name);
		}
	}
}

const rest = new REST({ version: '9' }).setToken(token);

// Deploys all user commands to all servers so that everyone can use them
// Private "dev" commands are not deployed as they should stay private to one server
// Run when editing CommandOptions or when adding a new command
(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();