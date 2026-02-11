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
		.setDescription('Allows you to see all cards you own with the filters specified.')
        .addStringOption(name =>
            name.setName('name')
            .setDescription('Character name.')
            .setRequired(false))
        .addStringOption(rarity =>
            rarity.setName('rarity')
            .setDescription('Rarity of card.')
            .addChoices(
                { name: 'Common', value: 'common'},
                { name: 'Uncommon', value: 'uncommon'},
                { name: 'Rare', value: 'rare'},  
                { name: 'Legendary', value: 'legendary'},
                { name: 'Mythical', value: 'mythical'},    
            )
            .setRequired(false))
        .addStringOption(type =>
            type.setName('type')
            .setDescription('Type of card.')
            .addChoices(
                { name: 'Normal', value: 'normal'},
                { name: 'Star', value: 'star'},  
                { name: 'Gold', value: 'gold' }
            )
            .setRequired(false))
        .addStringOption(holo =>
            holo.setName('holo')
            .setDescription('Include holos or exclude them.')
            .addChoices(
                { name: 'Yes', value: 'yes'},
                { name: 'No', value: 'no'},  
            )
            .setRequired(false))
        .addStringOption(favourited =>
            favourited.setName('favourited')
            .setDescription('Include favourites or exclude them.')
            .addChoices(
                { name: 'Yes', value: 'yes'},
                { name: 'No', value: 'no'},  
            )
            .setRequired(false))
        .addIntegerOption(minlevel =>
            minlevel.setName('minlevel')
            .setDescription('Card\'s Minimum Level.')
            .setRequired(false))
        .addIntegerOption(maxlevel =>
            maxlevel.setName('maxlevel')
            .setDescription('Card\'s Maximum Level.')
            .setRequired(false)),
    help: `Allows you to see all cards you own with the filters specified.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const filters = {
            name: interaction.options.getString('name'),
            rarity: interaction.options.getString('rarity'),
            type: interaction.options.getString('type'),
            holo: interaction.options.getString('holo'),
            minlevel: interaction.options.getInteger('minlevel'),
            maxlevel: interaction.options.getInteger('maxlevel'),
            favourited: interaction.options.getString('favourited'),
            tradebox: 'no'
        };

        const cards = await DbUserCards.findFilteredUserCards(interaction.user.id, filters);
        if(!cards || !cards.length) return interaction.editReply(`You have no cards with the applied filters.`);

        const collector = new CustomCollector(interaction, { hideComponentsOnTimeout: {} }, async() => {});
        collector.addSelectMenu(cards.map(card => ({ label: `${card.name} (${card.rarity})`, description: card.desc, value: card.index, emoji: card.emoji, cardToRender: card.data.image }) ), async(i) => {
            const selectedCard = cards[parseInt(i.values[0])];
            if(!selectedCard.render) {
                const render = new CardCanvas(interaction, selectedCard);
                await render.createCard();
                selectedCard.render = render.getCard();
            }
            await interaction.editReply({ files: [selectedCard.render] }).catch(e => console.error(e));
        }, {});
        await collector.start();
    },
}