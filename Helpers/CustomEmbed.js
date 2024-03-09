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
		const newTag = CustomEmbed.getTag(displayUser.tag);
		this.setTimestamp();

		// Display bot name, username, and their icon
		this.setFooter({ text: 'DyBot' });
		this.setAuthor({ name: `${newTag}`, iconURL: `${displayUser.displayAvatarURL()}` });
		this.setColor('Green');
	}

	/**
	 * Returns reformatted version of username (e.g. "larver#0" => "larver")
	 * @param {string} tag - The username to format
	 */
	static getTag(tag) {
		if(this.countCharactersAfterLastHash(tag) < 4) {
			let parts = tag.split('#');
			tag = parts[0];
		}
		return tag;
	}

	/**
     * Returns number of characters after the "#" in a username (e.g. "larver#0" => 1, "oli#7227" => 4)
     * @param {string} str - The username to check
     */
	static countCharactersAfterLastHash(str) {
		var index = str.lastIndexOf('#');
		if (index === -1) {
			// If there is no '#' in the string
			return 0;
		} else {
			// Calculate the number of characters after the last '#'
			return str.length - index - 1;
		}
	}
}
