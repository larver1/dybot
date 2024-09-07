const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const DbOrder = require('../../Helpers/DbOrder.js');
const { inlineCode, codeBlock } = require('discord.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('commissionlist')
		.setDescription('See how many order slots are open.'),
    help: `Shows a list of all art commissions currently in progress. You can order using \`/commission order create\` only when there is a free spot on the list. Express-Slots guarantee a delivery in 5 business-days.`,
	/**
	 * Execute command
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        await this.viewCommissions(interaction);
	},
    /**
     * Shows the orders currently in progress
     * @param {CommandInteraction} interaction - User's interaction with the bot 
     */
    async viewCommissions(interaction) {
        const currentOrders = await DbOrder.getOrdersInProgress();
        const expressItems = await DbOrder.getExpressItems();
        let msg = ``;
        let slotNo = 0;
        let expressNo = 0;

        // Show delivery slots
        for(const order of currentOrders) {
            const clientUser = await interaction.client.users.fetch(order.user_id);
            slotNo++;
            msg += `${slotNo}. ${DbOrder.orderStatusEmotes[order.status]} \`${clientUser.tag}\`\n`;
        }
        while(slotNo < 10) {
            msg += `${slotNo + 1}. Free Spot\n`;
            slotNo++;
        }

        // Show express slots
        msg += `### Express Delivery\n`;
        for(const item of expressItems) {
            const order = await DbOrder.getItemOrder(item);
            const clientUser = await interaction.client.users.fetch(order.user_id);
            for(let i = 0; i < item.express; i++) {
                msg += `${expressNo}. ${DbOrder.orderStatusEmotes[order.status]} \`${clientUser.tag}\`\n`;
                expressNo++;
            }
        }
        while(expressNo < 3) {
            msg += `${expressNo + 1}. Free Spot\n`;
            expressNo++;
        }

        const commissionsEmbed = new CustomEmbed(interaction)
        .setTitle('Commission List')
        .setDescription(`${msg}\n\n__Use \`/emotes order create\` to place an order__`)

        return interaction.editReply({ embeds: [commissionsEmbed] }).catch(e => console.log(e));
    },
}