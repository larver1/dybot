const { Collection, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const MessageHelper = require('../../Helpers/MessageHelper.js');
const DbUser = require('../../Helpers/DbUser.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');

const giveawayCooldown = new Collection();
const cooldownAmount = (300) * 1000;

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('Allows you to give away cards to other users, which can be claimed by reacting.')
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
    help: `Allows you to give away cards from your tradebox.`,
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
            tradebox: 'yes'
        };
        
        // User can only giveaway once every 5 minutes, so store the time of their last GA in a collection
		if(!giveawayCooldown.has("giveaway"))
            giveawayCooldown.set("giveaway", new Collection());

        const timestamps = giveawayCooldown.get("giveaway");
    
		// Check if user has given away in past 5 minutes
        if(timestamps.has(interaction.user.id))
        {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    		const now = Date.now();

			// Tell user to wait
            if(!interaction.debug && now < expirationTime)
            {
                const timeLeft = (expirationTime - now) / 1000 / 60;
                await interaction.editReply({ content: `Please wait ${timeLeft.toFixed(1)} minutes before giving away more cards.`, components: [], ephemeral: true }).catch(e => { console.log(e)});
				return;
            }
        }

        const cards = await DbUserCards.findFilteredUserCards(interaction.user.id, {favourited: false, ...filters} );
        if(!cards || !cards.length) return interaction.editReply(`You have no cards in your \`/tradebox\` with the applied filters.`);

        const collector = new CustomCollector(interaction, {}, async() => {});
        collector.addSelectMenu(cards.map(card => ({ label: `${card.name} (${card.rarity})`, description: card.desc, value: card.index, emoji: card.emoji, cardToRender: card.data.image }) ), async(i) => {
            const selectedCards = [];
            const now = new Date();
            const halfMinuteFromNow = now.setSeconds(now.getSeconds() + 30);

            i.values.map(index => selectedCards.push(cards[index]));
            
            const msg = await interaction.editReply({ embeds: [
                new CustomEmbed(interaction)
                .setTitle(`The following cards are being given away!`)
                .setDescription(MessageHelper.displayCardList(selectedCards, `React with a ❤️ to enter.\nThe winner will be randomly decided <t:${(Math.round(halfMinuteFromNow / 1000))}:R>.`))
                ], components: []}).catch(e => console.error(e));

            await msg.react(`❤️`).catch(e => { console.log(e)});
            
            this.collectEntries(interaction, msg, selectedCards);
        }, { pickAll: true });
        await collector.start();
    },
    async collectEntries(interaction, msg, cards) {
        // Store IDs of users who have entered
		const enteredGa = [];

		const gaFilter = (reaction) => reaction.emoji.name === '❤️';
		const gaCollector = msg.createReactionCollector({ filter: gaFilter, time: 30000, min: 1, errors: ['time'] });
			
		gaCollector.on('collect', async (reaction, claimUser) =>
		{
			// Add user to list of entered participants only if they play Poké Catcher
			let enteredUser = await DbUser.findUser( claimUser.id );
			if(!enteredUser) {
				return;
            }

			// Add user to list
			if(claimUser != interaction.user && !enteredGa.includes(claimUser) && !claimUser.bot) {
				enteredGa.push(claimUser);
            }
		});

        gaCollector.on('end', async() => {
            if (!enteredGa.length) {
                let gaOver = new CustomEmbed(interaction)
                .setTitle(`Giveaway ended with no entries`)
                .setDescription(`The Cards were not given away.`)
				await interaction.editReply({embeds: [gaOver]}).catch(e => { console.log(e)});
				return;
            }

            const won = enteredGa[Math.floor(Math.random() * enteredGa.length)];
            this.giveCards(interaction, cards, won);
        });
    },
    async giveCards( interaction, cards, won ) {
        const claimUsername = CustomEmbed.getTag(won.tag);
        const wonUser = await DbUser.findUser(won.id);

        await DbUserCards.changeOwnerOfCards(cards, won.id);

        let gaOver = new CustomEmbed(interaction)
        .setTitle(`Giveaway was won by ${claimUsername}!`)
        .setDescription(MessageHelper.displayCardList(cards, `Given away to <@${won.id}>!`))
        await interaction.editReply({embeds: [gaOver]}).catch(e => { console.log(e)});
        return;
    }
}