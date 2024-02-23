const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUser = require('../../Helpers/DbUser.js');
const DbOrder = require('../../Helpers/DbOrder.js');
const fs = require('fs');
const orderTypes = JSON.parse(fs.readFileSync('./Objects/OrderTypes.json'));
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
        .addSubcommand(order =>
            order.setName('order')
            .setDescription('View the coupons available to redeem.')
            .addStringOption(type =>
				type.setName('type')
                .setDescription('The type of order you want.')
                .addChoices(...orderTypes.map((order) => ({ name: order.name, value: order.value })))					  
                .setRequired(true)
            )
            .addStringOption(amount =>
				amount.setName('amount')
                .setDescription('The number of emotes you want.')
                .addChoices(
                    { name: "Small (x1)", value: "1" },
                    { name: "Medium (x3)", value: "3" },
                    { name: "Large (x6)", value: "6" },
                    { name: "Extra Large (x10)", value: "10" }
                )					  
                .setRequired(true)
            )),
	/**
	 * Direct the user two various commands to help them learn.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        if(subCommand == 'options') {
            this.viewOrderTypes(interaction);
        } else if(subCommand == 'order') {
            const type = interaction.options.getString('type');
            const amount = interaction.options.getString('amount');
            this.order(interaction, type, amount);
        } else {
            throw new Error(`Coupons subcommand is invalid! Got ${subCommand}`);
        }
	},
    /**
     * Displays all types of emotes someone can order
     * @param {CommandInteraction} interaction - User's interaction with the bot 
     */
    async viewOrderTypes(interaction) {
        const maxPages = orderTypes.length - 1;
        const prevPageId = uuidv4();
        const nextPageId = uuidv4();
        let page = 0;
        let currentOrderType = orderTypes[page];

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
            
            currentOrderType = orderTypes[page];
            msg = `__**Prices**__\n`;
            msg += `${currentOrderType.prices.map(order => `### x${order.size}: €${order.cost} (€${(order.cost / order.size).toFixed(2)} per Emote)`).join('\n')}`;
    
            emotesEmbed.setTitle(`${currentOrderType.name} [${page + 1}/${maxPages + 1}]`);
            emotesEmbed.setDescription(msg);
            emotesEmbed.setImage(currentOrderType.image);

            await interaction.editReply({ embeds: [emotesEmbed], components: [nextPage] }).catch(e => console.log(e));
        });
    },
    /**
     * Displays all types of emotes someone can order
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {string} type - The type of emote being ordered
     * @param {Integer} amount - The number of emotes being ordered
     */
    async order(interaction, type, amount) {
        
        const orderAmount = parseInt(amount);
        const orderType = orderTypes.find(order => order.value == type);
        const orderPrice = orderType.prices.find(prices => prices.size == orderAmount);
        const orderCost = orderPrice.cost;

        const user = await DbUser.findUser(interaction.user.id);
        if(!user) throw new Error(`No user is found with ID ${interaction.user.id}`);

        const availableCoupons = await user.getCouponsOfValue(orderCost);
        if(availableCoupons.length) {
            const selectId = uuidv4();
            const cancelId = uuidv4();
            
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
                switch(i.customId) {
                    case selectId:
                        await user.removeCoupon()
                } 
            });

            return;
        } else {
            await this.confirmOrder(interaction, orderType, orderAmount, orderCost);
        }

    },
    /**
     * 
     * @param {CommandInteraction} interaction - User's interaction with the bot 
     * @param {string} orderType - The type of order being confirmed 
     * @param {Integer} orderAmount - The size of the order 
     * @param {Number} orderCost - The cost of the order 
     */
    async confirmOrder(interaction, orderType, orderAmount, orderCost) {
        const warnCollector = await MessageHelper.warnMessage(interaction, "order", { 
            type: orderType.name,
            amount: orderAmount,
            cost: orderCost
        });

        warnCollector.on('confirmed', async i => {
            await DbOrder.createOrder(interaction.user.id, orderType, orderAmount, null);
            await interaction.editReply({ content: `You have successfully ordered: \`${orderType.name} x${orderAmount}\`\nDyron has been notified of the order and will be in touch shortly.`, embeds: [], components: [] }).catch(e => console.log(e));
        });

        warnCollector.on('declined', async i => {
            return interaction.editReply({ content: `The order has been cancelled.`, embeds: [], components: [] }).catch(e => console.log(e));
        });
    }
}