const { v4: uuidv4 } = require('uuid');
const CustomEmbed = require('../Helpers/CustomEmbed.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const tickEmoji = "<a:tick:886245262169866260>";
const crossEmoji = "<a:cross:886245292339515412>";

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
				warning = new CustomEmbed(interaction)
					.setTitle(`Are you sure you want to order x${data.amount} of ${data.type}?`)
					.setDescription(`The total cost of this order will be\n## $${data.cost.toFixed(2)}`)
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
			if(collected.size <= 0)
			{
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
                value: `${coupon.coupon_id}`,
                emoji: coupon.emoji
            });
        }

        return selectionList;
    }
}