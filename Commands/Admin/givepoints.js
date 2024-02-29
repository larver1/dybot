const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const DbUser = require('../../Helpers/DbUser.js');
const fs = require('fs');
const couponData = JSON.parse(fs.readFileSync('./Objects/Coupons.json'));
const { Users, Coupons } = require('../../Database/Objects.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('givepoints')
		.setDescription('Give a user points.')
        .addIntegerOption(amount =>
            amount.setName('amount')
            .setDescription('The number of points you wish to give.')
            .setRequired(true)
        )
        .addUserOption(user =>
            user.setName('user')
            .setDescription('The user to give to.')
            .setRequired(true)
        ),
    section: "Admin",
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {

        if(interaction.client.config.adminId != interaction.user.id)
            return interaction.editReply({ content: `You do not have permission to use this command.` }).catch(e => console.log(e));

        const amount = interaction.options.getInteger('amount');
        const mentioned = interaction.options.getUser('user');

        const user = await DbUser.findUser(mentioned.id);
        if(!user) throw new Error(`No user is found with ID ${mentioned.id}`);

        this.givePoints(interaction, user, amount, mentioned.tag);
	},
    /**
     * Give user a coupon
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Users} user - User fetched from DB
     * @param {Number} amount - The number of coupons to buy
     * @param {String} tag - The user's tag
     */
    async givePoints(interaction, user, amount, tag) {
        if(amount <= 0) return interaction.editReply(`You must input a number of 1 or higher`);
        user.setDataValue('balance', user.getDataValue('balance') + amount)
        await user.save();
        return interaction.editReply(`You have successfully given x${amount} 💰 to ${tag}`);
    }
}