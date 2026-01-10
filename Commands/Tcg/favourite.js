const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const CardCanvas = require('../../Helpers/CardCanvas.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUser = require('../../Helpers/DbUser.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('favourite')
		.setDescription('Favourite/unfavourite cards with the filters specified.')
        .addStringOption(option =>
            option.setName('option')
            .setDescription('Choose whether to favourite or unfavourite.')
            .addChoices(
                { name: 'Favourite', value: 'favourite'},  
                { name: 'Unfavourite', value: 'unfavourite'},  
            )
            .setRequired(true))
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
        .addIntegerOption(minlevel =>
            minlevel.setName('minlevel')
            .setDescription('Card\'s Minimum Level.')
            .setRequired(false))
        .addIntegerOption(maxlevel =>
            maxlevel.setName('maxlevel')
            .setDescription('Card\'s Maximum Level.')
            .setRequired(false)),
    help: `Favourite/unfavourite cards with the filters specified. Favourited cards can't be: Sold, Sacrificed, or put in the Tradebox.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const willFavourite = interaction.options.getString('option') === 'favourite';
        const filters = {
            name: interaction.options.getString('name'),
            rarity: interaction.options.getString('rarity'),
            type: interaction.options.getString('type'),
            holo: interaction.options.getString('holo'),
            minlevel: interaction.options.getInteger('minlevel'),
            maxlevel: interaction.options.getInteger('maxlevel'),
            favourited: willFavourite ? 'no' : 'yes'
        };

        await DbUser.pauseUser(interaction.user.id);

        const cards = await DbUserCards.findFilteredUserCards(interaction.user.id, filters);
        if(!cards || !cards.length) {
            await DbUser.unpauseUser(interaction.user.id);
            return interaction.editReply(`You have no cards with the applied filters.`);
        }

        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.addSelectMenu(cards.map(card => ({ label: `${card.name} (${card.rarity})`, description: card.desc, value: card.index, emoji: card.emoji, cardToRender: card.data.image }) ), async(i) => {
            const selectedCards = [];
            i.values.map(index => selectedCards.push(cards[index]));
            for(let card of selectedCards) {
                card = await DbUserCards.updateUserCard(card, { fav: willFavourite });
            }
            await interaction.editReply({ embeds: [
                new CustomEmbed(interaction)
                .setTitle(`The following cards have been ${willFavourite ? 'favourited' : 'unfavourited'}!`)
                .setDescription(MessageHelper.displayCardList(selectedCards, `Favourited cards can't be: Sold, Sacrificed, Traded, or put in Giveaway.`))
        ], components: []}).catch(e => console.error(e));
            await DbUser.unpauseUser(interaction.user.id);
        }, { pickAll: true });
        collector.addCancelButton(interaction.user.id);
        await collector.start();
    },
}