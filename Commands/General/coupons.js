const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUser = require('../../Helpers/DbUser.js');
const fs = require('fs');
const couponData = JSON.parse(fs.readFileSync('./Objects/Coupons.json'));
const { Users, Coupons } = require('../../Database/Objects');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('coupons')
		.setDescription('View and redeem coupons.')
        .addSubcommand(view =>
			view.setName('view')
			.setDescription('View the coupons available to redeem.'))
        .addSubcommand(buy =>
            buy.setName('buy')
            .setDescription('Redeem a coupon of a certain type and price')
            .addStringOption(type =>
				type.setName('type')
                .setDescription('The type of coupon you wish to redeem.')
                .addChoices(...couponData.map((coupon) => ({ name: coupon.name, value: coupon.name })))					  
                .setRequired(true)
            )
            .addIntegerOption(amount =>
				amount.setName('amount')
                .setDescription('The number of coupons you wish to redeem.')
                .setRequired(true)
            )
        ),
    help: 'Allows you to view all types of coupon and redeem one in exchange for virtual currency. You may check your balance and coupons using \`/profile\`.\n- \`/coupons view\`: View each type of coupon and the amount of virtual money it costs.\n- \`/coupons buy\`: Redeem a coupon of a certain type in exchange for virtual currency.',
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const user = await DbUser.findUser(interaction.user.id);
        if(!user) throw new Error(`No user is found with ID ${interaction.user.id}`);

        if(subCommand == 'view') {
            this.viewCoupons(interaction, user);
        } else if(subCommand == 'buy') {
            const type = interaction.options.getString('type');
            const amount = interaction.options.getInteger('amount');
            await user.pause();
            this.buyCoupon(interaction, user, type, amount);
        } else {
            throw new Error(`Coupons subcommand is invalid! Got ${subCommand}`);
        }
	},
    /**
     * View all coupons available to redeem
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Users} user - User fetched from DB
     */
    async viewCoupons(interaction, user) {
		const coupons = await Coupons.findAll();
        let msg = `${user.balance} DyDots\n \`/coupons buy\` to buy an item.\n\n`;
        msg += `${coupons.map(i => `${i.emoji} \`${i.name} ${MessageHelper.padString(i.name)} ${i.cost}${MessageHelper.extraPadding(i.cost)}\``).join('\n')}`;
        
        const shopEmbed = new CustomEmbed(interaction)
        .setTitle('Coupons to Redeem')
        .setDescription(msg)

        return interaction.editReply({ embeds: [shopEmbed] }).catch(e => console.log(e));
    },
    /**
     * Buy a coupon with your balance
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Users} user - User fetched from DB
     * @param {String} type - The type of coupon being bought
     * @param {Number} amount - The number of coupons to buy
     */
    async buyCoupon(interaction, user, type, amount) {
        const couponType = await Coupons.findOne({ where: { name: type }});
        if(!couponType) throw new Error(`Did not pass in valid coupon type. Received ${type}`);

        if(amount <= 0) {
            user.unpause();
            return interaction.editReply(`You must input a number of 1 or higher`);
        }

        const cost = couponType.getDataValue('cost') * parseInt(amount);

        if(!(await user.takeMoney(cost))) {
            user.unpause();
            return interaction.editReply(`You do not have enough DyDots to redeem \`x${amount} ${type}\``).catch(e => console.log(e));
        }

        await user.addCoupon(couponType, amount);

        user.unpause();
        return interaction.editReply(`You have successfully redeemed x${amount} ${type} for 💰${cost.toLocaleString('en-US', { style: 'decimal' })}`);
    }
}