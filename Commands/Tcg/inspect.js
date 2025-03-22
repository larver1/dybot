const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const CardCanvas = require('../../Helpers/CardCanvas.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('inspect')
		.setDescription('View and redeem coupons.')
        .addStringOption(name =>
            name.setName('name')
            .setDescription('The name of the card you wish to inspect.')
            .setRequired(true)
    ),
    help: `Allows you to see all cards you own with the name specified.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const cardName = interaction.options.getString('name');
        const cards = await DbUserCards.findUserCardByName(interaction.user.id, cardName);
        if(!cards.length) return interaction.editReply(`You have no cards of the name \`${cardName}\`.`);

        const card = await new CardCanvas(interaction, cards[0].data);
        await card.createCard();
        await interaction.editReply({ files: [card.getCard()] }).catch(e => console.error(e));
        return;

        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.addSelectMenu(cards.map(card => ({ label: card.data.name, description: card.data.rarity, value: card.index, image: card.data.image }) ), async(i) => {
            await interaction.editReply(cards[parseInt(i.values[0])].data.image).catch(e => console.log(e));
        });
        await collector.start();
    },
}