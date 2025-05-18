const { UserCards } = require('../Database/Objects');
const fs = require('fs');
const CardData = JSON.parse(fs.readFileSync('./Objects/CardData.json'));
/**
 * Interface for performing DB operations to a user.
 */
module.exports = class DbUserCards {

    /**
     * Finds a card's data by name
     * @param {string} name 
     * @returns 
     */
    static findCardByName(name) {
        return CardData.find(card => card.name.toLowerCase() == name.toLowerCase());
    }

	/**
	 * Fetches all cards of a given name that a user of the given ID owns
	 * @param {string} id - User's discord ID.
     * @param {string} name - Name of the card.
	 */
    static async findUserCardByName(id, name) {
        // Check if card by name exists
        const cardObj = this.findCardByName(name);
        if(!cardObj && name.toLowerCase() != "all") return null;

        // Check if user has any of the specific card
		const userCards = name.toLowerCase() == "all"  
         ? await UserCards.findAll({ where: { user_id: id } })
         : await UserCards.findAll({ where: { user_id: id, dex_id: cardObj.id } });

        // Attach JSON data to each card
		for(let i = 0; i < userCards.length; i++) { userCards[i].data = CardData[userCards[i].dex_id - 1]; userCards[i].index = i; }
        return userCards;
    }

    /**
     * Adds card of ID to user
     * @param {Number} userId - User's ID
     * @param {Object} card - Card's details
     */
    static async giveUserCard(userId, card) {
        if(card.details.star && card.details.gold) throw Error('Card can\'t be both gold and star');
        await UserCards.create({ 
            user_id: userId, 
            dex_id: parseInt(card.id),
            rarity: card.rarity,
            star: card.details.star,
            gold: card.details.gold,
            holo: card.details.holo,
            first_edition: true
        });
        return true;
    }

}