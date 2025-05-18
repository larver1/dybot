const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder, InteractionResponse } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const DbUser = require('../../Helpers/DbUser.js');
const CardBuilder = require('../../Helpers/CardBuilder.js');
const CardCanvas = require('../../Helpers/CardCanvas.js');
const CardsView = require('../../Helpers/CardsView.js');

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

        const user = await DbUser.findUser(interaction.user.id);
        if(!user.canOpenPack() && !interaction.client.config.debug) return interaction.editReply({ content: `You opened a pack <t:${(user.last_pack / 1000)}:R>. You can only open a pack every \`6 hours\`.` }).catch(e => console.error(e));

        // Get cards and store to user
        const pack = await CardBuilder.openPack();

        const renders = [];
        const fullImages = [];
        for(const card of pack) {
            const newCard = await DbUserCards.giveUserCard(interaction.user.id, card);
            fullImages.push(newCard);
            const render = new CardCanvas(interaction, newCard);
            await render.createCard();
            renders.push(render.getCard());
        }

        const fullImage = new CardsView(interaction, fullImages);
        await fullImage.createCards();
        renders.push(fullImage.getCards());
        await user.resetPackTimer();

        // Display to user
        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.images = renders;
        collector.addImagePages({ noPrev: true, disappearOnLast: true });
        await collector.start();    
    },

}