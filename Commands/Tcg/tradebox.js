const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
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
		.setName('tradebox')
		.setDescription('Allows you to see all cards you own with the filters specified.')
        .addSubcommand(add =>
            add.setName('add')
			.setDescription('Add a card to your tradebox')
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
            )
        .addSubcommand(remove =>
            remove.setName('remove')
            .setDescription('Remove cards from your tradebox'),
        ),
    help: `Allows you to separately store cards you don't need anymore in here to later trade, sell, sacrifice or give them away. If you decide to keep a card, you can move it back out. Cards in your regular storage can't be traded, sold, sacrificed or given away as a safety measure for your collection, so move them in this box first.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
       
        const filters = {
            name: interaction.options.getString('name'),
            rarity: interaction.options.getString('rarity'),
            type: interaction.options.getString('type'),
            holo: interaction.options.getString('holo'),
            minlevel: interaction.options.getInteger('minlevel'),
            maxlevel: interaction.options.getInteger('maxlevel'),
            favourited: interaction.options.getString('favourited'),
        };

       filters.tradebox = (subCommand == "remove" ) ? 'yes' : 'no';

        const cards = await DbUserCards.findFilteredUserCards(interaction.user.id, filters);
        if(!cards || !cards.length) return interaction.editReply(`You have no cards with the applied filters.`);

        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.addSelectMenu(cards.map(card => ({ label: `${card.name} (${card.rarity})`, description: card.desc, value: card.index, emoji: card.emoji, cardToRender: card.data.image }) ), async(i) => {
            const selectedCards = cards.filter( (card, cardIndex) => i.values.includes(cardIndex.toString()));
            for (const card of selectedCards) {
                await DbUserCards.updateUserCard(card, { tradebox: subCommand == "add" ? true : false } );
            }

            let tradeboxComplete = new CustomEmbed(interaction)
            .setTitle(`Tradebox`)
            .setDescription(`The following cards have been ${subCommand == 'remove' ? 'removed from' : 'added to' } the trade box.\n${MessageHelper.displayCardList(selectedCards, '')}`)
            await interaction.editReply( { embeds: [tradeboxComplete], components: [] }).catch(e => console.error(e));
        }, { pickAll: true } );
        await collector.start();
    },
}