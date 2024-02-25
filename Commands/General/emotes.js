const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUser = require('../../Helpers/DbUser.js');
const DbOrder = require('../../Helpers/DbOrder.js');
const fs = require('fs');
const itemTypes = JSON.parse(fs.readFileSync('./Objects/ItemTypes.json'));
const { Users, Coupons } = require('../../Database/Objects');
const { v4: uuidv4 } = require('uuid');
const crossEmoji = "<a:cross:886245292339515412>";

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('emotes')
		.setDescription('View and redeem coupons.')
        .addSubcommand(view =>
			view.setName('options')
			.setDescription('See the types of emotes you can buy.'))
        .addSubcommandGroup(order =>
            order
                .setName('order')
                .setDescription('Access your orders or create new ones.')
            .addSubcommand(create =>
                create.setName('create')
                .setDescription('Create a new order.'))
            .addSubcommand(view =>
                view.setName('view')
                .setDescription('View your orders.'))
        ),
	/**
	 * Direct the user two various commands to help them learn.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
		const subCommandGroup = interaction.options._group ? interaction.options.getSubcommandGroup() : null;

        if(subCommand == 'options') {
            this.viewOrderTypes(interaction);
        } else if(subCommandGroup == 'order') {
            if(subCommand == 'create') {
                const type = interaction.options.getString('type');
                const amount = interaction.options.getString('amount');
                this.order(interaction, type, amount);
            } else if(subCommand == 'view') {
                this.viewOrders(interaction);
            }
        } else {
            throw new Error(`Coupons subcommand is invalid! Got ${subCommand}`);
        }
	},
    /**
     * Displays all types of emotes someone can order
     * @param {CommandInteraction} interaction - User's interaction with the bot 
     */
    async viewOrderTypes(interaction) {
        const maxPages = itemTypes.length - 1;
        const prevPageId = uuidv4();
        const nextPageId = uuidv4();
        let page = 0;
        let currentOrderType = itemTypes[page];

        let msg = `__**Prices**__\n`;
        msg += `${currentOrderType.prices.map(order => `### x${order.size}: €${order.cost} (€${(order.cost / order.size).toFixed(2)} per Emote)`).join('\n')}`;

        const emotesEmbed = new CustomEmbed(interaction)
        .setTitle(`${currentOrderType.name} [${page + 1}/${maxPages + 1}]`)
        .setDescription(msg)
        .setImage(currentOrderType.image)

        const nextPage = new ActionRowBuilder()
        .addComponents(			
            new ButtonBuilder()
                .setCustomId(prevPageId)
                .setLabel('Prev Page: ')
                .setEmoji('<:leftarrow:709828405952249946>')
                .setStyle(ButtonStyle.Secondary),	
            new ButtonBuilder()
                .setCustomId(nextPageId)
                .setLabel('Next Page: ')
                .setEmoji('<:rightarrow:709828406048587806>')
                .setStyle(ButtonStyle.Secondary))

        const interactionReply = await interaction.editReply({ embeds: [emotesEmbed], components: [nextPage] }).catch(e => console.log(e));

        const filter = i => i.user.id === interaction.user.id && (i.customId == prevPageId || i.customId == nextPageId);
        const collector = interactionReply.createMessageComponentCollector({ filter, time: 300_000, errors: ['time'] });
        collector.on('collect', async i => { 
			await i.deferUpdate().catch(e => {console.log(e)});

			if(i.customId == prevPageId) {
				if(page == 0) page = maxPages;
				else page--;
			} else if(i.customId == nextPageId) {
				if(page < maxPages) page++;
				else page = 0;
			}
            
            currentOrderType = itemTypes[page];
            msg = `__**Prices**__\n`;
            msg += `${currentOrderType.prices.map(order => `### x${order.size}: €${order.cost} (€${(order.cost / order.size).toFixed(2)} per Emote)`).join('\n')}`;
    
            emotesEmbed.setTitle(`${currentOrderType.name} [${page + 1}/${maxPages + 1}]`);
            emotesEmbed.setDescription(msg);
            emotesEmbed.setImage(currentOrderType.image);

            await interaction.editReply({ embeds: [emotesEmbed], components: [nextPage] }).catch(e => console.log(e));
        });
    },
    /**
     * Checks value of order and verifies which coupons would be applicable
     * @param {Integer} value - The value of the order
     */
    async checkOrderValue(value) {
        const coupons = await Coupons.findAll();
        const sortedCoupons = coupons.sort((a, b) => b.value - a.value);
        for(let i = 0; i < sortedCoupons.length; i++) {
            const coupon = sortedCoupons[i];
            if(value > coupon.value) return coupon.value;
        }
    },
    /**
     * Allows user to order
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {string} type - The type of emote being ordered
     * @param {Integer} amount - The number of emotes being ordered
     */
    async order(interaction, type, amount) {

        const user = await DbUser.findUser(interaction.user.id);
        if(!user) throw new Error(`No user is found with ID ${interaction.user.id}`);

        const addId = uuidv4();
        const confirmId = uuidv4();
        const cancelId = uuidv4();
        let orderItemsMsg = ``;
        let totalCost = 0;

        const orderEmbed = new CustomEmbed(interaction)
        .setTitle(`Your Order`)
        .setDescription(`Add items to your order. Once you are finished, hit "confirm".\n${orderItemsMsg}`)

        const addItemButton = new ActionRowBuilder()
        .addComponents(			
            new ButtonBuilder()
                .setCustomId(addId)
                .setLabel('Add Item')
                .setEmoji('➕')
                .setStyle(ButtonStyle.Secondary))

        const orderOptions = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(confirmId)
                .setLabel('Confirm')
                .setEmoji('<a:tick:886245262169866260>')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(cancelId)
                .setLabel('Cancel')
                .setEmoji('<a:cross:886245292339515412>')
                .setStyle(ButtonStyle.Danger)
        )
        const embeds = [orderEmbed];
        const components = [addItemButton, orderOptions];
        const orderItems = [];

        const interactionReply = await interaction.editReply({ embeds: embeds, components: components }).catch(e => console.log(e));
        const filter = i => i.user.id === interaction.user.id && (i.customId == addId || i.customId == confirmId || i.customId == cancelId);
        const collector = interactionReply.createMessageComponentCollector({ filter, time: 300_000, errors: ['time'] });
        collector.on('collect', async i => { 
            await i.deferUpdate().catch(e => {console.log(e)});
            if(i.customId == cancelId) {
                collector.stop();
                return interaction.editReply({ content: `The order has been cancelled.`, components: [] }).catch(e => console.log(e));
            } else if(i.customId == confirmId) {
                if(!orderItems.length) {
                    return interaction.editReply({ content: `${interaction.user}, you must add at least one item before confirming an order` }).catch(e => console.log(e));
                } else {
                    collector.stop();
                    const orderValue = await this.checkOrderValue(totalCost);
                    const availableCoupons = await user.getCouponsOfValue(orderValue);

                    if(availableCoupons.length) return this.selectCoupon(interaction, user, orderItems, availableCoupons);
                    else return this.confirmOrder(interaction, user, orderItems);
                }
            } else if(i.customId == addId) {
                // Disable buttons
                MessageHelper.activateButtons(components, false);
                await interaction.editReply({ embeds: embeds, components: components }).catch(e => console.log(e));            }

                // Follow up message
                await this.addItem(interaction, components, collector);

        });

        collector.on('addItem', async item => {
            orderItems.push(item);
            const orderType = DbOrder.getItemData(item.type);
            const orderPrice = DbOrder.getItemPrice(orderType, item.size);
            orderItemsMsg = `${MessageHelper.displayOrderItems(orderItems)}`;
            totalCost += orderPrice.cost;

            embeds[0].setDescription(`Please add items to your order. Once you are finished, hit "confirm".\n${orderItemsMsg}\n\n__**Total Base Cost: ${totalCost.toFixed(2)}€**__`);
            await interaction.editReply({ embeds: embeds, components: components }).catch(e => console.log(e));
        });

    },
    /**
     * Add an item to an order
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Array} orderMessageComponents - Message components
     * @param {Collector} orderCollector - The message collector of the order message
     */
    async addItem(interaction, orderMessageComponents, orderCollector) {

        // Get all order types
        const selectOrderTypes = MessageHelper.getGenericSelectMenu(itemTypes.map((order) => ({ name: order.name, value: order.value }) ))[0];
        const selectOrderAmounts = MessageHelper.getGenericSelectMenu([ 
            { name: 'Small (x1)', value: 'small' }, 
            { name: 'Medium (x3)', value: 'medium' }, 
            { name: 'Large (x6)', value: 'large' }, 
            { name: 'Extra Large (x10)', value: 'xl' }
        ])[0];

        const orderTypeId = uuidv4();
        const orderAmountId = uuidv4();
        const confirmId = uuidv4();
        const cancelId = uuidv4();

        // Build necessary components
        const orderTypeSelectMenu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(orderTypeId)
                .setPlaceholder('Select an Order Type')
                .addOptions(selectOrderTypes) 
                .setMinValues(1)
                .setMaxValues(1),  
        );
        const orderAmountSelectMenu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(orderAmountId)
                .setPlaceholder('Select an Order Size')
                .addOptions(selectOrderAmounts)
                .setMinValues(1)
                .setMaxValues(1),   
        );
        const orderOptions = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(confirmId)
                .setLabel('Confirm')
                .setEmoji('<a:tick:886245262169866260>')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(cancelId)
                .setLabel('Cancel')
                .setEmoji('<a:cross:886245292339515412>')
                .setStyle(ButtonStyle.Danger)
        )

        const components = [orderTypeSelectMenu, orderAmountSelectMenu, orderOptions];
        const interactionReply = await interaction.followUp({ content: `Please select an order type and order size`, components: components }).catch(e => console.log(e));
        
        const filter = i => i.user.id === interaction.user.id && (i.customId == orderTypeId || i.customId == orderAmountId || i.customId == confirmId || i.customId == cancelId);
        const collector = interactionReply.createMessageComponentCollector({ filter, time: 300_000, errors: ['time'] });
        
        let currentOrderType, currentOrderAmount;
        
        collector.on('collect', async i => { 
            await i.deferUpdate().catch(e => {console.log(e)});

            if(i.customId == orderTypeId) {
                currentOrderType = i.values[0];
            } 
            else if(i.customId == orderAmountId) {
                currentOrderAmount = i.values[0];
            } 
            else if(i.customId == confirmId || i.customId == cancelId) {
                // If confirming, add item to list
                if(i.customId == confirmId) {
                    if(!currentOrderType || !currentOrderAmount) {
                        return interactionReply.edit({ content: `You must select an order type and order amount before confirming. `}).catch(e => console.log(e));
                    } else {
                        orderCollector.emit('addItem', { type: currentOrderType, size: currentOrderAmount });
                    }
                }

                // Delete message and reactivate order buttons
                MessageHelper.activateButtons(orderMessageComponents, true);
                await interactionReply.delete().catch(e => console.log(e));
                await interaction.editReply({ components: orderMessageComponents }).catch(e => console.log(e));
            
            }
        });
    },
    /**
     * 
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Users} user - User fetched from DB
     * @param {Array} orderItems - Array of items added to the order 
     * @param {Array} availableCoupons - All coupons the user can select 
     */
    async selectCoupon(interaction, user, orderItems, availableCoupons) {
        const selectId = uuidv4();
        const cancelId = uuidv4();
        let selectedCoupon;
        
        const couponEmbed = new CustomEmbed(interaction)
        .setTitle(`Would you like to apply a Coupon to save money off your order?`)
        
        const selectList = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(selectId)
                .setPlaceholder(`Select a Coupon`)
                .addOptions(MessageHelper.getCouponsSelectMenu(availableCoupons)),
        );

        const cancelButton = new ActionRowBuilder()
        .addComponents(			
            new ButtonBuilder()
                .setCustomId(cancelId)
                .setLabel('No Thanks')
                .setEmoji(crossEmoji)
                .setStyle(ButtonStyle.Danger))

        const interactionReply = await interaction.editReply({ embeds: [couponEmbed], components: [selectList, cancelButton] }).catch(e => console.log(e));
        const filter = i => (i.user.id === interaction.user.id) && (i.customId == selectId || i.customId == cancelId);
        const collector = await interactionReply.createMessageComponentCollector({ filter, time: 60000, errors: ['time'], max: 1 });    
        
        collector.on('collect', async i => {
            await i.deferUpdate().catch(e => {console.log(e)});
            if(i.customId == selectId) selectedCoupon = availableCoupons[parseInt(i.values)];
            await this.confirmOrder(interaction, user, orderItems, selectedCoupon);    
        });

        collector.on('end', async collected => {
            if(collected.size <= 0) {
                await interaction.editReply({ content: "The command timed out.", components: [] }).catch(e => console.log(e));	
                return;
            }
        });
    },
    /**
     * Allows user to confirm the details of their order before creating it
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Users} user - User fetched from DB 
     * @param {Array} orderItems - The list of items added to the order 
     * @param {UserCoupons} coupon - The coupon selected
     */
    async confirmOrder(interaction, user, orderItems, coupon) {
        const warnCollector = await MessageHelper.warnMessage(interaction, "order", { 
            items: orderItems,
            coupon: coupon ? coupon.coupon : null
        });

        warnCollector.on('confirmed', async i => {
            const order = await DbOrder.createOrder(user, orderItems, coupon ? coupon.coupon : null);
            order.items = await order.getItems();
            await MessageHelper.sendOrderDM(interaction, order);
            await interaction.editReply({ content: `Your order has been created successfully, you will receive a DM with the receipt. Dyron has also been notified of the order and will be in touch shortly.`, embeds: [], components: [] }).catch(e => console.log(e));
        });

        warnCollector.on('declined', async i => {
            return interaction.editReply({ content: `The order has been cancelled.`, embeds: [], components: [] }).catch(e => console.log(e));
        });
    },
    /**
     * Allows user to view their orders
     * @param {CommandInteraction} interaction - User's interaction with the bot  
     */
    async viewOrders(interaction) {
        const orders = await DbOrder.getUserOrders(interaction.user.id, true);
        const selectOrders = MessageHelper.getGenericSelectMenu(orders.map(order =>  ({ name: `Order #${order.order_id}: ${order.status}`, description: `${MessageHelper.displayOrderItemsSummary(order.items)}` })));
        const selectId = uuidv4();
        const prevPageId = uuidv4();
        const nextPageId = uuidv4();
        const cancelId = uuidv4();
        const maxPages = selectOrders.length - 1;

        let page = 0;
        let orderIndex, order, viewOrderEmbed;

        let orderTypeSelectMenu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(selectId)
                .setPlaceholder(`[Page ${page + 1}/${maxPages + 1}] Select an Order`)
                .addOptions(selectOrders[page]) 
                .setMinValues(1)
                .setMaxValues(1),  
        );

        const nextPage = new ActionRowBuilder()
        .addComponents(			
            new ButtonBuilder()
                .setCustomId(prevPageId)
                .setLabel('Prev Page: ')
                .setEmoji('<:leftarrow:709828405952249946>')
                .setStyle(ButtonStyle.Secondary),	
            new ButtonBuilder()
                .setCustomId(nextPageId)
                .setLabel('Next Page: ')
                .setEmoji('<:rightarrow:709828406048587806>')
                .setStyle(ButtonStyle.Secondary))

            const cancelButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(cancelId)
                    .setLabel('Cancel Order')
                    .setEmoji('<a:cross:886245292339515412>')
                    .setStyle(ButtonStyle.Danger)
            )

        const interactionReply = await interaction.editReply({ components: [orderTypeSelectMenu, nextPage] }).catch(e => console.log(e));
        const filter = i => i.user.id === interaction.user.id && (i.customId == prevPageId || i.customId == nextPageId || i.customId == selectId || i.customId == cancelId);
        const collector = interactionReply.createMessageComponentCollector({ filter, time: 300_000, errors: ['time'] });

        collector.on('collect', async i => { 
            await i.deferUpdate().catch(e => {console.log(e)});
			if(i.customId == prevPageId) {
				if(page == 0) page = maxPages;
				else page--;
			} else if(i.customId == nextPageId) {
				if(page < maxPages) page++;
				else page = 0;
			} else if(i.customId == selectId) {
                
                orderIndex = parseInt(i.values);
                order = orders[orderIndex];

                viewOrderEmbed = await MessageHelper.displayOrderEmbed(interaction, order, order.items);
            } else if(i.customId == cancelId) {
                const warnCollector = await MessageHelper.warnMessage(interaction, "cancel");
                warnCollector.on('confirmed', async i => {
                    await this.cancelOrder(interaction, order);

                    // View orders again
                    collector.stop();
                    await this.viewOrders(interaction);

                    return;
                });
                warnCollector.on('declined', async i => {
                    const embeds = viewOrderEmbed ? [viewOrderEmbed] : null;
                    await interaction.editReply({ content: ` `, embeds: embeds, components: [orderTypeSelectMenu, nextPage, cancelButton] }).catch(e => console.log(e));
                    return;
                });
                return;
            }

            orderTypeSelectMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(selectId)
                    .setPlaceholder(`[Page ${page + 1}/${maxPages + 1}] Select an Order`)
                    .addOptions(selectOrders[page]) 
                    .setMinValues(1)
                    .setMaxValues(1),  
            );

            const embeds = viewOrderEmbed ? [viewOrderEmbed] : null;
            cancelButton.components[0].setDisabled(order.status != "received");

            await interaction.editReply({ content: ` `, embeds: embeds, components: [orderTypeSelectMenu, nextPage, cancelButton] }).catch(e => console.log(e));
    
        })
    },
    /**
     * 
     * @param {CommandInteraction} interaction - User's interaction with the bot 
     * @param {Orders} order - The order to cancel 
     */
    async cancelOrder(interaction, order) {
        await DbOrder.cancelOrder(order);
        await MessageHelper.sendOrderDM(interaction, order, true);
        await interaction.editReply({ content: `Order #${order.order_id} has been cancelled.`, embeds: [] }).catch(e => console.log(e));
    }
}