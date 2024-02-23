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

		let hasCreatedProfile = false;

		// Try to find user info
		let user = await DbUser.findUser(interaction.user.id);
		
		// If no user profile yet, create one
		if(user) hasCreatedProfile = true; 
		else user = await DbUser.createUser(interaction.user.id, CustomEmbed.getTag(interaction.user.tag));

		// If still no user even after creating it, something is wrong
		if(!user) throw new Error('No user found!');

		// Build profile embed
		const profileEmbed = new CustomEmbed(interaction)
			.setTitle(`${user.tag}'s Profile!`)
			.setDescription(`DyDots: ${user.balance}`)
			.setThumbnail(interaction.user.displayAvatarURL())

		// Build coupons embed
		const couponsMsg = await user.displayCoupons();
		const couponsEmbed = new CustomEmbed(interaction)
			.setTitle(`${user.tag}'s Coupons!`)
			.setDescription(couponsMsg)

		// Display it
		await interaction.editReply({ embeds: [profileEmbed, couponsEmbed] }).catch(e => console.log(e));
		if(!hasCreatedProfile) await interaction.followUp(`${interaction.user}, your profile has successfully been created!`).catch(e => console.log(e));
	}
}