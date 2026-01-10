const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const fs = require('fs');
let commands = [];

(async() => {	
	// Get every user command to display on command options
	const commandFiles = fs.readdirSync(`./Commands/General`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		commands.push(file.replace('.js', ''));
	}
})();

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Learn how to use DyBot.')
		.addStringOption(commandName =>
			commandName.setName('commandname')
				.setDescription('The name of the command to get info on.')
				.addChoices(...commands.map((commandName) => ({ name: commandName, value: commandName })))					  
		),
	help: `Gives information about how the bot works. You can choose a specific commandName to get info on a specific command, like what you're doing right now :)`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {

		const commandName = interaction.options.getString('commandname');
		if(!commandName) {
			await this.displayHelpMessage(interaction);
		} else {
			await this.displayCommandInfo(interaction, commandName);
		}
	},
	/**
	 * Displays help message to user
	 * @param {CommandInteraction} interaction - User's interaction with the bot
	 */
	async displayHelpMessage(interaction) {
		const commands = interaction.client.commands;
		let msg = `You can use this bot to place orders, redeem coupons with virtual currency, and compete on a global leaderboard!\n\nA list of commands is shown below, you may use \`/help commandName\` for a description on what a command does.\n\n`
		msg += `\`/${commands.filter(command => command.section != "Admin").map(command => command.data.name).join('` `/')}\``;

		await interaction.editReply({ embeds: [
            new CustomEmbed(interaction)
                .setTitle('Welcome to DyBot!')
                .setDescription(msg)
            ]
        }).catch(e => { console.error(e)});
	},
	/**
	 * Displays info regarding a specific command
	 * @param {CommandInteraction} interaction - User's interaction with the bot 
	 * @param {String} commandName - The name of the command selected 
	 */
	async displayCommandInfo(interaction, commandName) {
        const command = interaction.client.commands.get(commandName.toLowerCase());
		

		return interaction.editReply({ content: `## \`/${command.data.name}\`\n${command.help}` }).catch(e => console.error(e));
	}
}