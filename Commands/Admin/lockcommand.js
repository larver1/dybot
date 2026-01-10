const { SlashCommandBuilder } = require('discord.js');
const { Commands } = require('../../Database/Objects.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('lockcommand')
		.setDescription('Lock a command in case of emergencies.')
		.addStringOption(commandName =>
            commandName.setName('commandname')
                .setDescription('The first word of the command name.')
                .setRequired(true))
		.addBooleanOption(lock =>
			lock.setName('lock')
				.setDescription('Choose to lock or unlock the command.')
				.setRequired(true)),
	section: 'Admin',
	usage: 'commandName',
	/**
	 * A dev-only command which toggles a command from being accessed by all players.
	 * Use in case of emergency when there is an exploit/bug involved with a certain command.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 * @param {Users} user - User data fetched from DB.
	 * @param {dbAccess} dbAccess - Reference to DB interface to perform queries.
	 * @param {Object} extras - Extra data provided by the command handler
	 */
	async execute(interaction) {
		// Only mods can use the command
        if(interaction.client.config.adminId != interaction.user.id)
            return interaction.editReply({ content: `You do not have permission to use this command.` }).catch(e => console.error(e));

		const commandName = interaction.options.getString('commandname').toLowerCase();
		const lock = interaction.options.getBoolean('lock');

		// Find the command by name
		const command = await Commands.findOne({ where: { commandName: commandName } });
		if(!command) {
			await interaction.editReply({ content: `A command with name ${commandName} does not exist! Only use the first word of a command (e.g. 'team view' should just be 'team').`, components: [] }).catch(e => { console.log(e)});		
			return;	
		}

		// Change lock status and display it
		command.locked = lock;
		await command.save();
		return interaction.editReply({ content: `The command \`${commandName}\` is now ${command.locked ? `\`locked\`. Players will not be able to use it until it is unlocked again.` : `\`unlocked\`. Players may use the command again.`}`}).catch((e) => console.log(e));
	}
}