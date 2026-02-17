const { SlashCommandBuilder } = require('discord.js');
const DbUser = require('../../Helpers/DbUser.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reminder')
		.setDescription('Toggle reminders for pack openings.')
		.addStringOption(toggle =>
			toggle.setName('toggle')
				.setDescription('Choose whether to activate/deactivate the reminder.')
				.addChoices(
					{ name: 'Yes', value: 'yes' },
					{ name: 'No', value: 'no' }
				)
				.setRequired(true)),
	section: 'misc',
	/**
	 * User can get information regarding current Poké Catcher events and updates.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
		const toggle = interaction.options.getString('toggle') == 'yes' ? true : false;
        const user = await DbUser.findUser(interaction.user.id);

		// Update object to reflect changes
		user.reminders = toggle;
		const msg = `You will ${toggle ? 'now' : 'no longer'} receive DM notifications regarding \`/open\`.`;

		// Update DB
        await user.save();

		// Display all news messages
		await interaction.editReply({ content: msg }).catch(e => { console.log(e)});
	}
}