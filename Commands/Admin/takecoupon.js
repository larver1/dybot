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
		.setName('takecoupon')
		.setDescription('Take a coupon away from a user.')
        .addStringOption(type =>
            type.setName('type')
            .setDescription('The type of coupon you wish to take.')
            .addChoices(...couponData.map((coupon) => ({ name: coupon.name, value: coupon.name })))					  
            .setRequired(true)
        )
        .addIntegerOption(amount =>
            amount.setName('amount')
            .setDescription('The number of coupons you wish to take.')
            .setRequired(true)
        )
        .addUserOption(user =>
            user.setName('user')
            .setDescription('The user to take from.')
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

        const type = interaction.options.getString('type');
        const amount = interaction.options.getInteger('amount');
        const mentioned = interaction.options.getUser('user');

        const user = await DbUser.findUser(mentioned.id);
        if(!user) throw new Error(`No user is found with ID ${mentioned.id}`);

        this.takeCoupon(interaction, user, type, amount, mentioned.tag);
	},
    /**
     * Take coupon from a user
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Users} user - User fetched from DB
     * @param {String} type - The type of coupon being bought
     * @param {Number} amount - The number of coupons to buy
     * @param {String} tag - The user's tag
     */
    async takeCoupon(interaction, user, type, amount, tag) {
        const couponType = await Coupons.findOne({ where: { name: type }});
        if(!couponType) throw new Error(`Did not pass in valid coupon type. Received ${type}`);
        if(amount <= 0) return interaction.editReply(`You must input a number of 1 or higher`);

        if(!await user.removeCoupon(couponType, amount))
            return interaction.editReply(`Error removing x${amount} ${type} from ${tag}. You can't remove more coupons than a user has.`);
        
        return interaction.editReply(`You have successfully taken x${amount} ${type} from ${tag}`);
    }
}