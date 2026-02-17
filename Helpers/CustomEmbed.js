const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

/**
 * Extension of EmbedBuilder with custom formatting
 */
module.exports = class CustomEmbed extends EmbedBuilder {
	/**
	 * Creates a new embed to display to user
	 * @constructor
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	constructor(interaction, user) {		
		super();

		// Get username
		const displayUser = user ? user : interaction.user;
		this.setTimestamp();

		// Display bot name, username, and their icon
		this.setFooter({ text: 'DyBot' });
		this.setAuthor({ name: displayUser.username, iconURL: `${displayUser.displayAvatarURL()}` });
		this.setColor('Green');
	}
}
