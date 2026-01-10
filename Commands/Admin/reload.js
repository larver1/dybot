const { SlashCommandBuilder } = require('discord.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Dev command.')
		.addStringOption(commandName =>
            commandName.setName('commandname')
                .setDescription('The name of command to reload.')
                .setRequired(true)),
	section: 'Admin',
	/**
	 * Dev-only command which re-compiles a command on all shards without the bot needing to restart.
	 * Use when you want to apply changes to a command.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 * @param {Users} user - User data fetched from DB.
	 * @param {dbAccess} dbAccess - Reference to DB interface to perform queries.
	 * @param {Object} extras - Extra data provided by the command handler
	 */
	async execute(interaction) {
        if(interaction.client.config.adminId != interaction.user.id)
            return interaction.editReply({ content: `You do not have permission to use this command.` }).catch(e => console.error(e));

		// Find command by name
		const commandToReload = interaction.options.getString('commandname').toLowerCase();
		const command = interaction.client.commands.get(commandToReload);

		if(!command)
			return interaction.editReply(`There is no command with the name \`${commandToReload}\`.`);

		// Removes current command file from cache and requires new version
		function reloadCommand(c, { name, dir })
		{
			const fs = require('fs');
			const path = require('path');
			const command = c.commands.get(name);

			// Goes back one directory to ./commands
			const commandDir = path.join(dir,'../');

			// Gets all the subFolders
			const commandFolder = fs.readdirSync('./commands', { withFileTypes: true })
			.filter((item) => item.isDirectory())
			.map((item) => item.name);

			// find which sub-folder the commnd is in
			let subFolderName;
			for(const folder of commandFolder){
				const filePath = path.join(`${commandDir}`, `./${folder}/${command.data.name}.js`)
				try{
					fs.accessSync(filePath, fs.constants.F_OK);
					subFolderName = folder;
				}catch (err){
					// File not found in this directory
				}
			}

			delete require.cache[require.resolve(path.join(`${commandDir}`, `./${subFolderName}/${command.data.name}.js`))];
			const newCommand = require(path.join(`${commandDir}`, `./${subFolderName}/${command.data.name}.js`));
			c.commands.set(newCommand.data.name, newCommand);
		}

		// broadcastEval means the command is called across all shards.
		// Without this, the command would only be updated on one shard, not updating it for all servers.
		try {
			interaction.client.cluster.broadcastEval(reloadCommand, { context: { name: commandToReload, dir: __dirname }});
			interaction.editReply(`Command \`${commandToReload}\` was reloaded!`).catch(e => { console.log(e)});
		} catch (error) {
			console.error(error);
			interaction.editReply(`There was an error while reloading a command \`${commandToReload}\`:\n\`${error.message}\``).catch(e => { console.log(e)});
		}
	}
}