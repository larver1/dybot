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
		.setName('commissions')
		.setDescription('See how many order slots are open.'),
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

        for(let i = 0; i < 10; i++) {
            const order = currentOrders[i];
            if(order) {
                const clientUser = await interaction.client.users.fetch(order.user_id);
                msg += `${i}. ${DbOrder.orderStatusEmotes[order.status]} \`${clientUser.tag}\`\n`;
            } else {
                msg += `${i}. Free Spot\n`
            }
        }

        msg += `### Express Delivery\n`;
        for(let i = 0; i < 3; i++) {
            const item = expressItems[i];
            if(item) {
                const order = await DbOrder.getItemOrder(item);
                const userId = order.user_id;
                const clientUser = await interaction.client.users.fetch(userId);
                msg += `${i}. ${DbOrder.orderStatusEmotes[order.status]} \`${clientUser.tag}\`\n`;
            } else {
                msg += `${i}. \n`;
            }
        }

        const commissionsEmbed = new CustomEmbed(interaction)
        .setTitle('Commissions List')
        .setDescription(`${msg}\n\n__Use \`/emotes order create\` to place an order__`)

        return interaction.editReply({ embeds: [commissionsEmbed] }).catch(e => console.log(e));
    },
}