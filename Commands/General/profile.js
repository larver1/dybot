const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
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
	help: `Displays your user data, such as your virtual balance and your coupons inventory.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {

		let hasCreatedProfile = false;
		let newProfileMessage = ``;

		// Try to find user info
		let user = await DbUser.findUser(interaction.user.id);	
		// If no user profile yet, create one
		if(user) hasCreatedProfile = true; 
		
		// If just created profile, ask if they want to be on global leaderboard
		if(!hasCreatedProfile) {
			const warnCollector = await MessageHelper.warnMessage(interaction, "leaderboard");
			warnCollector.on('confirmed', async i => {
				user = await DbUser.createUser(interaction.user.id, true);
				newProfileMessage = `You have chosen to be visible on the \`/leaderboard\`. You may change this at any time using \`/leaderboard visible\`.`;
				await this.viewProfile(interaction, user, newProfileMessage);
			});
	
			warnCollector.on('declined', async i => {
				user = await DbUser.createUser(interaction.user.id, false);
				newProfileMessage = `You have chosen to be hidden from the \`/leaderboard\`. You may change this at any time using \`/leaderboard visible\`.`;
				await this.viewProfile(interaction, user, newProfileMessage);
			});

			warnCollector.on('end', async collected => {
				if(collected.size <= 0) {
					if(user) user.unpause();
					return interaction.editReply({ content: "The command timed out.", components: [] }).catch(e => console.error(e));	
				}
			});
		} else {
			// If still no user even after creating it, something is wrong
			if(!user) throw new Error('No user found!');
			await this.viewProfile(interaction, user);
		}
	},
	async viewProfile(interaction, user, newProfileMessage) {
		// Build profile embed
		const profileEmbed = new CustomEmbed(interaction)
			.setTitle(`${interaction.user.tag}'s Profile!`)
			.setDescription(`Level: ${user.level}\nDyDots: ${user.balance}${user.first_pack ? '\nFirst Pack: ' +  `<t:${(user.first_pack / 1000)}:f>` : '\n'}`)
			.setThumbnail(interaction.user.displayAvatarURL())

		// Build coupons embed
		const couponsMsg = await user.displayCoupons();
		const couponsEmbed = new CustomEmbed(interaction)
			.setTitle(`${interaction.user.tag}'s Coupons!`)
			.setDescription(couponsMsg)

		// Display it
		await interaction.editReply({ embeds: [profileEmbed, couponsEmbed], components: [] }).catch(e => console.error(e));
		if(newProfileMessage) await interaction.followUp(`${interaction.user}, your profile has been created!\n\n${newProfileMessage}`).catch(e => console.error(e));
	}
}