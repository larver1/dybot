const { SlashCommandBuilder } = require('discord.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stardresscd')
		.setDescription('Check amount of time left until Star Dress should be finished.'),
	help: `Check amount of time left until Star Dress should be finished.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
		const starDressTimestamp = 1758916800;
		let dateFuture = new Date( starDressTimestamp * 1000 );
		let dateNow = new Date();

		var seconds = Math.floor((dateFuture - (dateNow)) / 1000);
		var minutes = Math.floor(seconds / 60);
		var hours = Math.floor(minutes / 60);
		var days = Math.floor(hours / 24);

		hours = hours - (days * 24);
		minutes = minutes-(days * 24 * 60)-(hours * 60);
		seconds = seconds-(days * 24 * 60 * 60)-(hours * 60 * 60)-(minutes * 60);

		return interaction.editReply({ content: `There is \`${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds\` left to finish the star-dress!`}).catch(e => console.log(e));
	}
}