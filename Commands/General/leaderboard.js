const { SlashCommandBuilder, inlineCode } = require('discord.js');
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
		.setName('leaderboard')
		.setDescription('See who has the most DyDots.')
        .addSubcommand(view =>
			view.setName('view')
			.setDescription('View the top 10 DyBot users.'))
        .addSubcommand(visible =>
            visible.setName('visible')
            .setDescription('Choose to show or hide yourself from the leaderboard.')
            .addStringOption(option =>
                option.setName('option')
                    .setDescription('Show all the icons you own.')
                    .addChoices(
                        { name: 'Yes', value: 'yes'},
                        { name: 'No', value: 'no'},
                    )
                    .setRequired(true))),
    help: `Allows you to see the rankings of players ordered by their virtual balance. Also gives you the option to opt out of the leaderboard if you wish.\n- \`/leaderboard view\`: Shows the current leaderboard as well as your own ranking.\n- \`/leaderboard visible\`: Allows you to toggle your visibility on the leaderboard.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
		if(subCommand == 'view') {
            await this.viewLeaderboard(interaction);
        } else if(subCommand == 'visible') {
            await this.changeVisibility(interaction);
        }
	},
    /**
     * Shows the top 10 users on the leaderboard, as well as your own position on the leaderboard
     * @param {CommandInteraction} interaction - User's interaction with the bot 
     */
    async viewLeaderboard(interaction) {
        const user = await DbUser.findUser(interaction.user.id);
        const topUsers = await DbUser.getTopUsers();
        let userPosition;

        let msg = ``;
        for(let i = 0; i < topUsers.length; i++) {
            if(i < 10 && topUsers[i].leaderboard) {
                const clientUser = await interaction.client.users.fetch(topUsers[i].user_id);
                const bal = `💰${topUsers[i].getDataValue('balance')}`;
                const shortenedTag = clientUser.tag.length > 18 ? `${clientUser.tag.slice(0, numChars - 3)}...` : clientUser.tag;
                msg += `${inlineCode(`${i + 1}.${i < 9 ? ' ' : ''} ${shortenedTag}${MessageHelper.padString(shortenedTag, 18, true)}: ${bal}${MessageHelper.extraPadding(bal, 8)} DyDots`)}\n`;
            }
            if(topUsers[i].user_id == interaction.user.id) {
                userPosition = i + 1;
            }
        }

        msg += `\n\nYou have ${user.balance} DyDots. You are in position ${userPosition}`;
        await interaction.editReply({ content: msg }).catch(e => console.log(e));
    },
    /**
     * Changes a user's visibility on the leaderboard
     * @param {CommandInteraction} interaction - User's interaction with the bot
     */
    async changeVisibility(interaction) {
        const visible = interaction.options.getString('option') == 'yes';
        const user = await DbUser.findUser(interaction.user.id);
        user.setDataValue('leaderboard', visible);
        await user.save();
        await interaction.editReply({ content: `You are now ${visible ? `visible` : `hidden from`} \`/leaderboard view\`.` }).catch(e => console.log(e));
    }
}