const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const CardCanvas = require('../../Helpers/CardCanvas.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('box')
		.setDescription('Shows a view of all cards you own with the filters specified.')
        .addStringOption(name =>
            name.setName('name')
            .setDescription('Character name.')
            .setRequired(false))
        .addStringOption(stacking =>
            stacking.setName('stacking')
            .setDescription('Whether to stack multiple of the same card.')
            .addChoices(
                { name: 'Yes', value: 'yes'},
                { name: 'No', value: 'no'},  
            )
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
            .setRequired(false))
        .addStringOption(tradebox =>
            tradebox.setName('tradebox')
            .setDescription('Include tradebox cards or exclude them.')
            .addChoices(
                { name: 'Yes', value: 'yes'},
                { name: 'No', value: 'no'},  
            )
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
            tradebox: interaction.options.getString('tradebox')
        };

        const stacking = interaction.options.getString('stacking') === 'yes';
        const cards = await DbUserCards.findFilteredUserCards(interaction.user.id, filters);
        if(!cards || !cards.length) return interaction.editReply(`You have no cards with the applied filters.`);

        const cardList = [];
        const msgList = [];        
        const cardsPerPage = 25;
        const cardCounts = {};
        const stackedCards = [];

        if (stacking) {
            for (const card of cards) {
                if (cardCounts[card.card_name]) {
                    cardCounts[card.card_name]++;
                } else {
                    cardCounts[card.card_name] = 1;
                    stackedCards.push(card);
                }
            }
        }

        const cardLength = stacking ? stackedCards.length : cards.length;
        const maxPages = Math.ceil(cardLength / cardsPerPage);

        for(let i = 0; i < maxPages; i++) {
            cardList[i] = [];
            for(let j = i * cardsPerPage; j < Math.min((i * cardsPerPage) + cardsPerPage, cardLength); j++) {
                cardList[i].push(stacking ? stackedCards[j] : cards[j]);
            }
            msgList.push(MessageHelper.displayCardList(cardList[i], `Box Page ${i + 1}/${maxPages}`, stacking ? cardCounts : null));
        }

        const collector = new CustomCollector(interaction, { hideComponentsOnTimeout: { components: [] } }, async() => {});
        collector.addEmbedPages('Box', msgList);
        await collector.start();
    },
}