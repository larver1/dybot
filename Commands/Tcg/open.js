const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder, InteractionResponse } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const DbUser = require('../../Helpers/DbUser.js');
const CardBuilder = require('../../Helpers/CardBuilder.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('Open a pack of cards.'),
    help: `Open a pack of five cards once every 6 hours.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        // Get cards and store to user
        const pack = await CardBuilder.openPack();
        for(const card of pack) await DbUserCards.giveUserCardByID(interaction.user.id, card.id);

        // Display to user
        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.images = pack.map(card => card.image);
        collector.addImagePages({ noPrev: true, disappearOnLast: true });
        await collector.start();    
    },

}