const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const DbUser = require('../../Helpers/DbUser.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('View your DyBot profile.'),
	/**
	 * Direct the user two various commands to help them learn.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {

		const user = await DbUser.findUser(interaction.user.id);
		if(user) return interaction.editReply({ content: 'You have already created a profile!' }).catch(e => console.log(e));

		await DbUser.createUser(interaction.user.id, CustomEmbed.getTag(interaction.user.tag));
		return interaction.editReply({ content: `Your profile has successfully been created!` }).catch(e => console.log(e));
	}
}