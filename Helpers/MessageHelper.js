const { v4: uuidv4 } = require('uuid');
const CustomEmbed = require('../Helpers/CustomEmbed.js');
const DbOrder = require('../Helpers/DbOrder.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, inlineCode } = require('discord.js');
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
	 * @param {Message} editMsg - If non-null, the interaction wont be replied to and the passed in message will be edited instead
     * @param {Boolean} noDefer - Whether to ignore deferring the interaction update 
     */
    static async warnMessage(interaction, type, data, editMsg, noDefer) {
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
				let specialMsg = ``;
				for(const item of data.items) if(item.special) specialMsg = ' + Special Item Cost';
				if(data.coupon) {
					discountCost = DbOrder.getOrderDiscount(orderCost, data.coupon);
					discountMsg = `~~${orderCost.toFixed(2)}€~~ `;
				} 
				warning = new CustomEmbed(interaction)
					.setTitle(`Are you sure you want to order the following Emotes?`)
					.setDescription(`${MessageHelper.displayOrderItems(data.items)}\nThe total cost of this order will be\n## ${discountMsg ? discountMsg : ""}${discountCost.toFixed(2)}€${specialMsg}\n${data.coupon ? `__You applied a ${data.coupon.emoji} ${data.coupon.name} coupon.__` : ``}`)
				break;
			case "leaderboard":
				warning = new CustomEmbed(interaction)
				.setTitle(`Do you want to be shown on the leaderboard?`)
				.setDescription(`This will mean that any user who uses DyBot could see your username. Is this okay?\n\nYou can change this option at any time using \`/leaderboard visible\``)
				break;
			case "cancel":
				warning = new CustomEmbed(interaction)
				.setTitle(`Are you sure you want to cancel this order?`)
				.setDescription(`Any coupons you used will be refunded back to you.`)
				break;
			case "progress":
				const newStatus = data.status == 'received' ? 'started' : 'complete';
				warning = new CustomEmbed(interaction)
				.setTitle(`Are you sure you want to progress this order to \`${newStatus}\`?`)
				.setDescription(`You will not be able to change it back afterwards.`)
				break;
			case "express":
				const perEmotePrice = DbOrder.getPerEmotePrice(data.itemPrice);
				warning = new CustomEmbed(interaction)
				.setTitle(`Would you like to add Express Delivery to some of your emotes?`)
				.setDescription(`There are currently **${data.numExpress}** Express Slot(s) available.\n\nBy paying an extra ${perEmotePrice.toFixed(2)}€ per emote, you can guarantee it will be delivered within **5 working days.**`)
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
		
		let interactionReply;
		if(editMsg) interactionReply = await editMsg.edit({ content: content, embeds: embeds, components: components }).catch(e => console.error(e));
		else interactionReply = await interaction.editReply({ content: content, embeds: embeds, components: components }).catch(e => console.error(e));

		const filter = i => (i.user.id === interaction.user.id) && (i.customId == acceptId || i.customId == declineId);
		const collector = await interactionReply.createMessageComponentCollector({ filter, time: 60000, errors: ['time'], max: noDefer ? 999 : 1 });
        
		// Emit events when either confirm or decline button is pressed
		collector.on('collect', async i => {
            if(!noDefer) await i.deferUpdate().catch(e => {console.error(e)});
			if(i.customId == acceptId)
				collector.emit('confirmed', i);
            else if(i.customId == declineId)
				collector.emit('declined', i);
			else if(i.customId == cancelId)
				collector.emit('cancelled');
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
        selectionList[0] = [];
        let page = 0;
        
        for(let i = 0; i < components.length; i++) {
            // Each SelectMenu can only have 20 items, so start a new page
            if((i + 1) % 26 == 0) {
                page++; 
                selectionList.push([]);
            } 

			// Add item to SelectMenu
			selectionList[page].push({
				label: components[i].name,
				description: components[i].description ? components[i].description : ' ',
				value: components[i].value ? `${components[i].value}` : `${i}`
			});
        }

        return selectionList;
    }

	/**
	 * Send the admin and the user a confirmation of a new order
	 * @param {CommandInteraction} interaction - User's interaction with the bot 
	 * @param {Orders} order - The order that was just created
	 * @param {String} status - The new status of the order 
	 */
	static async sendOrderDM(interaction, order, status) {
        const client = await interaction.client.users.fetch(order.user_id);
        const admin = await interaction.client.users.fetch(interaction.client.config.adminId);
		if(!client || !admin) throw new Error('Client or Admin users could not be found.');

		const orderCost = DbOrder.getTotalOrderCost(order.items);
		const coupon = order.coupon_id ? await Coupons.findOne({ where: { coupon_id : order.coupon_id } }) : null; 
		const discountCost = coupon ? DbOrder.getOrderDiscount(orderCost, coupon) : orderCost;

		let couponMsg;
		if(coupon) {
			if(status == 'cancelled') couponMsg = `\n\nThe ${coupon.emoji} ${coupon.name} Coupon has been given back.`;
			else couponMsg = `\n\n${coupon.emoji} ${coupon.name} Coupon was used on this order.`;
		}

		// Send notification to admin
		const orderEmbed = new CustomEmbed(interaction, admin)
		.setDescription(`ID: \`#${order.order_id}\`\nFrom: \`${client.tag} (ID: ${client.id})\`\n${MessageHelper.displayOrderItems(order.items)}\nCost: ${coupon ? `~~\`${orderCost.toFixed(2)}€\`~~ ` : ``}\`${discountCost.toFixed(2)}€\`${couponMsg ? couponMsg : ''}`)

		if(order.status == 'cancelled') orderEmbed.setTitle(`This order has been cancelled! ❌`);
		else if(order.status == 'received') orderEmbed.setTitle(`You received a New Order! 🥳`);
		else if(order.status == 'complete') orderEmbed.setTitle(`This order has been completed! ✅`)
		else if(order.status == 'started') orderEmbed.setTitle(`This order is now in progress! 🔃`)

		let notifyMsg = status == 'received' ? `\n\nDyron will be in touch shortly to discuss the commission and agree on a contract. If you wish to cancel this order, use \`/commission view\`.` : ``;

		// Send receipt to client
		const receiptEmbed = new CustomEmbed(interaction, client)
		.setDescription(`ID: \`#${order.order_id}\`\n${MessageHelper.displayOrderItems(order.items)}\nCost: ${coupon ? `~~\`${orderCost.toFixed(2)}€\`~~ ` : ``}\`${discountCost.toFixed(2)}€\`${couponMsg ? couponMsg : ''}${notifyMsg}`)

		if(order.status == 'cancelled') receiptEmbed.setTitle(`This order has been cancelled! ❌`);
		else if(order.status == 'received') receiptEmbed.setTitle(`Your order confirmation`);
		else if(order.status == 'complete') receiptEmbed.setTitle(`This order has been completed! ✅`)
		else if(order.status == 'started') receiptEmbed.setTitle(`This order is now in progress! 🔃`)

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
		return receiptEmbed;
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
			if(orderType.special) msg +=  `- ${orderType.name}${item.express ? `\n - ⏩ Express Delivery` : ``}\n`;
			else {
				const price = DbOrder.getItemPrice(orderType, item.size);
				const pricePerItem = DbOrder.getPerEmotePrice(price);
				msg += `- ${DbOrder.orderNames[item.size]} ${orderType.name} Emotes (${price.cost.toFixed(2)}€) ${item.express ? `\n - ⏩ Express Delivery for x${item.express} Emotes (+${(pricePerItem * item.express).toFixed(2)}€)` : ``} \n`;
			}
}
		return msg;
	}

	/**
	 * Display summary of an order's items in a list
	 * @param {Array} items
	 */
	static displayOrderItemsSummary(items) {
		let msg = ``;
		for(const item of items) {
			const orderType = DbOrder.getItemData(item.type);
			msg += `x${DbOrder.orderAmounts[item.size]} ${orderType && orderType.name ? orderType.name : null}, `;
		}
		msg = msg.slice(0, msg.length - 2);
		if(msg.length > 50) msg = `${msg.slice(0, 50)}...`;
		return msg;
	}

	/**
	 * Display an order in an embed
	 * @param {CommandInteraction} interaction - User's interaction with the bot  
	 * @param {Orders} order - The order being viewed
	 * @param {Array} orderItems - The list of items in the order
	 */
	static async displayOrderEmbed(interaction, order, orderItems) {
		const clientUser = await interaction.client.users.fetch(order.user_id);
		
		const orderCost = DbOrder.getTotalOrderCost(orderItems);
		const coupon = order.coupon_id ? await Coupons.findOne({ where: { coupon_id : order.coupon_id } }) : null; 
		const couponMsg = coupon ? `\`${coupon.emoji} ${coupon.name}\`` : `None`;
		const discountCost = coupon ? DbOrder.getOrderDiscount(orderCost, coupon) : orderCost;
		const discountMsg = coupon ? `~~\`${orderCost.toFixed(2)}€\`~~ ` : ``;

		const viewOrderEmbed = new CustomEmbed(interaction)
        .setTitle(`Order #${order.order_id}`)
        .setDescription(`Placed by: \`${clientUser.tag}\`\nStatus: \`${order.status}\`\nPrice: ${discountMsg}\`${discountCost}€\`\nCoupon Used: ${couponMsg}\n\n__**Items:**__\n${MessageHelper.displayOrderItems(orderItems)}`)
	
		return viewOrderEmbed;
	}

	static displayArchiveCard(name, emoji, rarity, gold, star, holo, first, owned) {
		const msg = `${owned ? '✅' : '❌'}${name} (${rarity})`;
		return `${emoji} \`${msg}${MessageHelper.padString(msg, 20)} ${first ? '1️⃣' : ''}${gold ? '🪙' : ''}${star ? '🌠' : ''}${holo ? '🌈' : ''}\``;
	}

	static displayCardList(cards, infoText) {
        let msg = `${infoText}\n\n`;
		for(let i = 0; i < cards.length; i++) {
			const card = cards[i];
			const details = `${card.name} (${card.rarity})`;
			const lvl = `lvl.${card.lvl}`;
			msg += `${card.emoji} ${inlineCode(`${i + 1}.${i < 9 ? ' ' : ''} ${details}${MessageHelper.padString(details, 30, true)}: ${lvl}${MessageHelper.extraPadding(lvl, 8)}`)} ${card.desc}\n`;
		}

        return msg;
    };

	/**
     * Helper function to align each item evenly on the screen so that they have the same number of characters
     * @param {string} string - The item name which determines how much padding to use
	 * @param {Integer} numSpaces - The number of spaces to use
	 * @param {Boolean} cutoff - Whether to cut off after certain number of characters
	 */
	static padString(string, numSpaces, cutoff) {
		let numChars = numSpaces ? numSpaces : 18;
		numChars -= string.length;
		let spaces = "";

		if(string.length > numChars)
			string = `${string.slice(0, numChars - 3)}...`;

		// For each remaining character, add a space to reach the character limit
		for(var i = 0; i < numChars; i++) 
			spaces += " ";
		
		return spaces;
	}

	/**
	 * Helper function to align each item on the screen so that they have the same number of characters
	 * @param {string} string - The item which determines how much padding to use
	 * @param {Integer} numSpaces - The number of spaces to use
	 */
	static extraPadding(string, numSpaces) {
		let spaces = "";
		let alignedSpace = numSpaces ? numSpaces : 4;

		for(var i = string.length; i < alignedSpace; i++) spaces += " ";
		return spaces;
	}

}