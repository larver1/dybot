const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUser = require('../../Helpers/DbUser.js');
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
		.setName('trade')
		.setDescription('Trade or sell Cards with another user.')
			.addUserOption(user =>
				user.setName('user')
					.setDescription('The user you wish to trade with.')
					.setRequired(true)),
	section: 'trading',
	usage: 'user',
	/**
	 * User can trade their Pokémon with another user, or exchange for cash.
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
		// Receive arguments
		// const offerMoney = interaction.options.getInteger('offermoney');
		// const receiveMoney = interaction.options.getInteger('receivemoney');
		const target = interaction.options.getUser('user');

		// Find target user data
		const targetUser = await DbUser.findUser(target.id);
	
		// Check if target user can be traded with
		if(!targetUser) 
			return interaction.editReply(`The other user does not play DyBot...`).catch(e => { console.log(e)});
		// if(interaction.user == target)
		// 	return interaction.editReply(`You can't trade with yourself...`).catch(e => { console.log(e)});

		// Get both users' tradelists
        const filters = { tradebox: 'yes' };
        const yourCards = await DbUserCards.findFilteredUserCards(interaction.user.id, filters);
        const targetCards = await DbUserCards.findFilteredUserCards(target.id, filters);

		// Trade can't go ahead with empty trade list
		if(!yourCards.length) {
			return interaction.editReply(`${interaction.user} has an empty \`/tradebox\`...`).catch(e => { console.log(e)});
        }
        if(!targetCards.length) {
			return interaction.editReply(`${target} has an empty \`/tradebox\`...`).catch(e => { console.log(e)});
        }
        
        const embeds = [];
        let offerCollector = await this.offerCards(interaction, yourCards, true, embeds, `What cards will you offer? ${interaction.user}`, target);
        offerCollector.collector.once('selected', async (offeredCards) => {
            offerCollector = null;
            let requestCollector = await this.offerCards(interaction, targetCards, false, embeds, `${interaction.user}, what cards will you request from ${target}?`, target);
            requestCollector.collector.once('selected', async(requestedCards) => {
                requestCollector = null;
                await interaction.editReply({ components: [], content: " " }).catch(e => { console.log(e)});
                await this.agreeToTrade(interaction, target, embeds, offeredCards, requestedCards);
            });
        })
	},
    // TODO offer twice bug
    async offerCards(interaction, cards, isOffered, embeds, msg, target) {
        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.embeds = embeds;
        collector.addSelectMenu(cards.map(card => ({ label: `${card.name} (${card.rarity})`, description: card.desc, value: card.index, emoji: card.emoji, cardToRender: card.data.image }) ), async(i) => {
            const selectedCards = cards.filter( (card, cardIndex) => i.values.includes(cardIndex.toString()));
            const chosenCards = new CustomEmbed(interaction)
                .setTitle(`Trade`)
                .setDescription(`The following cards have been ${isOffered ? `offered to ${target}` : `requested from ${target}`}.\n${MessageHelper.displayCardList(selectedCards, '')}`)
            embeds.push(chosenCards);
            await interaction.editReply( { embeds, components: [] }).catch(e => console.error(e));
            collector.collector.emit('selected', selectedCards );
        }, { pickAll: true } );
        await collector.start(msg);
        return collector;
    },
    async agreeToTrade(interaction, target, embeds, offeredCards, requestedCards) {
        const collector = new CustomCollector(interaction, { overrideId: target.id }, async() => {});
        collector.embeds = embeds;
        const oldEmbeds = [...embeds];
        collector.addConfirmationMessage(`Accept the trade`, ' ', {
				'decline': async(i) => {
					return interaction.editReply({ content: "The trade was cancelled.", components: [] }).catch(e => console.log(e));	
				},
				'confirm': async(i) => {
                    await DbUserCards.changeOwnerOfCards( offeredCards, target.id );
                    await DbUserCards.changeOwnerOfCards( requestedCards, interaction.user.id );
                    return interaction.editReply({ content: `Trade Complete! ${interaction.user}, ${target}`, embeds: oldEmbeds }).catch(e => console.log(e));;
                }
        });
        collector.start(`${target} Please accept or decline`);
    }
};