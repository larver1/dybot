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
	/**
	 * Direct the user two various commands to help them learn.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
		if(subCommand == 'view') {
            await this.viewLeaderboard(interaction);
        } else if(subCommand == 'visible') {
            const visible = interaction.options.getString('option') == 'yes';
            const user = await DbUser.findUser(interaction.user.id);
            user.setDataValue('leaderboard', visible);
            await user.save();
            await interaction.editReply({ content: `You are now ${visible ? `visible` : `hidden from`} \`/leaderboard view\`.` }).catch(e => console.log(e));
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
                msg += `${i + 1}. ${clientUser.tag}: ${topUsers[i].balance} DyDots`;
            }
            if(topUsers[i].user_id == interaction.user.id) {
                userPosition = i + 1;
            }
        }

        msg += `\n\n__You have ${user.balance} DyDots. You are in position X__`;
        await interaction.editReply({ content: msg }).catch(e => console.log(e));
    }
}