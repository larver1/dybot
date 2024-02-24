const { v4: uuidv4 } = require('uuid');
const CustomEmbed = require('../Helpers/CustomEmbed.js');
const DbOrder = require('../Helpers/DbOrder.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const tickEmoji = "<a:tick:886245262169866260>";
const crossEmoji = "<a:cross:886245292339515412>";
const fs = require('fs');
const itemTypes = JSON.parse(fs.readFileSync('./Objects/ItemTypes.json'));
const { Coupons } = require('../Database/Objects');

/**
 * A class to help with messages and reduce duplicate code
 */
module.exports = class MessageHelper {

    /**
     * Warns the user before proceeding
     * @param {CommandInteraction} interaction - A user's interaction with the bot
     * @param {string} type - The type of warning message to show
     * @param {Object} data - The values relevant to the warning message
     * @returns 
     */
    static async warnMessage(interaction, type, data) {
		let acceptId = uuidv4();
        let declineId = uuidv4();
		let content = ' ';

		// Format warning message
		let warning;
		switch(type) {
			case "order":
				let orderCost = DbOrder.getTotalOrderCost(data.items);
				let discountCost = orderCost;
				let discountMsg = "";
				if(data.coupon) {
					discountCost = DbOrder.getOrderDiscount(orderCost, data.coupon);
					discountMsg = `~~${orderCost.toFixed(2)}€~~ `;
				} 
				warning = new CustomEmbed(interaction)
					.setTitle(`Are you sure you want to order the following Emotes?`)
					.setDescription(`${MessageHelper.displayOrderItems(data.items)}\nThe total cost of this order will be\n## ${discountMsg ? discountMsg : ""}${discountCost.toFixed(2)}€\n${data.coupon ? `__You applied a ${data.coupon.emoji} ${data.coupon.name} coupon.__` : ``}`)
				break;
			case "leaderboard":
				warning = new CustomEmbed(interaction)
				.setTitle(`Do you want to be shown on the leaderboard?`)
				.setDescription(`This will mean that any user who uses DyBot could see your username. Is this okay?\n\nYou can change this option at any time using \`/leaderboard visible\``)
				break;
			default:
                throw new Error('No valid type passed in warn message.');
        }

		const embeds = [warning];
		const declineButton = new ButtonBuilder()
			.setCustomId(declineId)
			.setLabel(`Decline`)
			.setEmoji(`${crossEmoji}`)
			.setStyle(ButtonStyle.Secondary)
		const acceptButton = new ButtonBuilder()
			.setCustomId(acceptId)
			.setLabel(`Accept`)
			.setEmoji(`${tickEmoji}`)
			.setStyle(ButtonStyle.Secondary)

		const row = new ActionRowBuilder().addComponents(declineButton, acceptButton);
		const components = [row];
		
		const interactionReply = await interaction.editReply({ content: content, embeds: embeds, components: components }).catch(e => console.log(e));
		const filter = i => (i.user.id === interaction.user.id) && (i.customId == acceptId || i.customId == declineId);
		const collector = await interactionReply.createMessageComponentCollector({ filter, time: 60000, errors: ['time'], max: 1 });
        
		// Emit events when either confirm or decline button is pressed
		collector.on('collect', async i => {
            await i.deferUpdate().catch(e => {console.log(e)});
			if(i.customId == acceptId)
				collector.emit('confirmed', i);
            else if(i.customId == declineId)
				collector.emit('declined', i);
			else if(i.customId == cancelId)
				collector.emit('cancelled');
        });

		collector.on('end', async collected => {
			if(collected.size <= 0) {
				await dbAccess.add(interaction.user.id, "paused", 0);
				await interaction.editReply({ content: "The command timed out.", components: [] }).catch(e => console.log(e));	
				return;
			}
		});

		return collector;
	}

    /**
     * Puts all provided coupons into SelectMenu options
     * @param {Array} userCoupons - An array of UserCoupons
     */
    static getCouponsSelectMenu(userCoupons) {
        
        let selectionList = [];
        
        for(let i = 0; i < userCoupons.length; i++) {
            const coupon = userCoupons[i].coupon;
            selectionList.push({
                label: coupon.name,
                description: coupon.description,
                value: `${i}`,
                emoji: coupon.emoji
            });
        }

        return selectionList;
    }

	/**
	 * Pass in array of objects to place into SelectMenu
	 * @param {Array} components - Objects to put into select menu
	 */
	static getGenericSelectMenu(components) {
		let selectionList = [];
		for(let i = 0; i < components.length; i++) {
			selectionList.push({
				label: components[i].name,
				value: components[i].value ? `${components[i].value}` : `${i}`
			});
		}
		return selectionList;
	}

	/**
	 * Send the admin and the user a confirmation of a new order
	 * @param {CommandInteraction} interaction - User's interaction with the bot 
	 * @param {Orders} order - The order that was just created 
	 */
	static async sendOrderDM(interaction, order) {
        const client = await interaction.client.users.fetch(order.user_id);
        const admin = await interaction.client.users.fetch(interaction.client.config.adminId);
		if(!client || !admin) throw new Error('Client or Admin users could not be found.');

		const orderCost = DbOrder.getTotalOrderCost(order.items);
		const coupon = order.coupon_id ? await Coupons.findOne({ where: { coupon_id : order.coupon_id } }) : null; 
		const couponMsg = coupon ? `This client used a ${coupon.emoji} ${coupon.name} Coupon on their order.` : ``;
		const discountCost = coupon ? DbOrder.getOrderDiscount(orderCost, coupon) : orderCost;

		// Send notification to admin
		const orderEmbed = new CustomEmbed(interaction, admin)
		.setTitle(`You received a New Order! 🥳`)
		.setDescription(`ID: \`#${order.order_id}\`\nFrom: \`${client.tag} (ID: ${client.id})\`\n${MessageHelper.displayOrderItems(order.items)}\nCost: ${coupon ? `~~\`${orderCost.toFixed(2)}€\`~~ ` : ``}\`${discountCost.toFixed(2)}€\`\n\n${couponMsg ? couponMsg : ''}`)

		// Send receipt to client
		const receiptEmbed = new CustomEmbed(interaction, client)
		.setTitle(`Your order confirmation`)
		.setDescription(`ID: \`#${order.order_id}\`\n${MessageHelper.displayOrderItems(order.items)}\nCost: ${coupon ? `~~\`${orderCost.toFixed(2)}€\`~~ ` : ``}\`${discountCost.toFixed(2)}€\`\n\nDyron will be in touch shortly to discuss the commission and agree on a contract. If you wish to cancel this order, please let them know directly.`)

		try {
			await admin.send({ embeds: [orderEmbed] });
			console.log(`Sent reminder to ${admin.tag}`);
		} catch(error) {
			console.warn(`Failed to send reminder to ${admin.tag}`);
			console.warn(error);
		}

		try {
			await client.send({ embeds: [receiptEmbed] });
			console.log(`Sent reminder to ${client.tag}`);
		} catch(error) {
			console.warn(`Failed to send reminder to ${client.tag}`);
			console.warn(error);
		}
	}

	/**
	 * Enable/Disable buttons passed in
	 * @param {Array} components - Components to enable/disable
	 * @param {Boolean} enable - Whether to enable or disable
	 */
	static activateButtons(components, enable) {
		for(const component of components) {
			for(const object of component.components) {
				object.setDisabled(!enable);
			}
		}
		return components;
	}

	/**
	 * Display all of an order's items in a list
	 * @param {Array} items
	 */
	static displayOrderItems(items) {
		let msg = ``;
		for(const item of items) {
			const orderType = DbOrder.getItemData(item.type);
			msg += `- ${DbOrder.orderNames[item.size]} ${orderType.name} Emotes\n`;
		}
		return msg;
	}

}