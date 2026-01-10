const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const DbUser = require('../../Helpers/DbUser.js');
const CardCanvas = require('../../Helpers/CardCanvas.js');
const fs = require('fs');
const CardData = JSON.parse(fs.readFileSync('./Objects/CardData.json'));
const rarities = ["Common", "Uncommon", "Rare", "Legendary", "Mythical"];
const types = ["G", "S", "N"];
const holos = ["H", "N"];
const firstEditions = ["1", "0"];


/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Allows you to see all types of card you have owned.')
        .addStringOption(rarity =>
            rarity.setName('rarity')
            .setDescription('Rarity of card.')
            .addChoices(
                { name: 'Common', value: 'Common'},
                { name: 'Uncommon', value: 'Uncommon'},
                { name: 'Rare', value: 'Rare'},  
                { name: 'Legendary', value: 'Legendary'},
                { name: 'Mythical', value: 'Mythical'},    
            )
            .setRequired(false))
        .addStringOption(type =>
            type.setName('type')
            .setDescription('Type of card.')
            .addChoices(
                { name: 'Normal', value: 'N'},
                { name: 'Star', value: 'S'},  
                { name: 'Gold', value: 'G' }
            )
            .setRequired(false))
        .addStringOption(holo =>
            holo.setName('holo')
            .setDescription('Include holos or exclude them.')
            .addChoices(
                { name: 'Yes', value: 'H'},
                { name: 'No', value: 'N'},  
            )
            .setRequired(false))
        .addStringOption(first =>
            first.setName('first')
            .setDescription('Include first editions or exclude them.')
            .addChoices(
                { name: 'Yes', value: '1'},
                { name: 'No', value: '0'},  
            )
            .setRequired(false)),
    help: `Allows you to see all cards you own with the filters specified.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const filters = {
            rarity: interaction.options.getString('rarity'),
            type: interaction.options.getString('type'),
            holo: interaction.options.getString('holo'),
            first: interaction.options.getString('first')
        }; 

        const user = await DbUser.findUser(interaction.user.id, ['archive']);

        const filteredRarities = filters.rarity ? [filters.rarity] : rarities;
        const filteredTypes = filters.type ? [filters.type] : types;
        const filteredHolos = filters.holo ? [filters.holo] : holos;
        const filteredFirsts = filters.first ? [filters.first] : firstEditions;

        const selectionList = [];
        selectionList[0] = "";
        let count = 0;
        let page = 0;

        for (let i = 0; i < CardData.length; i++) {
            for (const rarity of filteredRarities) {    
                for (const type of filteredTypes) {
                    for(const holo of filteredHolos) {
                        for(const firstEdition of filteredFirsts ) {
                            count++;
                            if(count >= 25) {
                                selectionList.push([]);
                                page++;
                                count = 0;
                            } 
                            let id = `${i+1}${rarity[0]}${type}${holo}${firstEdition}`;
                            const msg = MessageHelper.displayArchiveCard(
                                CardData[i].name, 
                                CardData[i].emote, 
                                rarity, 
                                type === 'G', type === 'S', holo === 'H', firstEdition === '1',
                                user.archive.includes(id)
                            );
                            selectionList[page] += `${msg}\n`;
                        }
                    }
                }
            }
        }

        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.addEmbedPages('Your Archive', selectionList);
        await collector.start();

        // const cards = await DbUserCards.findFilteredUserCards(interaction.user.id, filters);
        // if(!cards || !cards.length) return interaction.editReply(`You have no cards with the applied filters.`);

        // const collector = new CustomCollector(interaction, {}, async() => {});
        // collector.addSelectMenu(cards.map(card => ({ label: `${card.name} (${card.rarity})`, description: card.desc, value: card.index, emoji: card.emoji, cardToRender: card.data.image }) ), async(i) => {
        //     const selectedCard = cards[parseInt(i.values[0])];
        //     if(!selectedCard.render) {
        //         const render = new CardCanvas(interaction, selectedCard);
        //         await render.createCard();
        //         selectedCard.render = render.getCard();
        //     }
        //     await interaction.editReply({ files: [selectedCard.render] }).catch(e => console.error(e));
        // }, {});
        // await collector.start();
    }
}