const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Learn how to use DyBot.'),
	/**
	 * Direct the user two various commands to help them learn.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {

		await interaction.editReply({ embeds: [
            new CustomEmbed(interaction)
                .setTitle('Hey There')
                .setDescription('yeet')
            ]
        }).catch(e => { console.log(e)});
	}
}