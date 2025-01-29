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
        return CardData.find(card => card.name == name);
    }

	/**
	 * Fetches all cards of a given name that a user of the given ID owns
	 * @param {string} id - User's discord ID.
     * @param {string} name - Name of the card.
	 */
    static async findUserCardByName(id, name) {
        // Check if card by name exists
        const cardObj = this.findCardByName(name);
        if(!cardObj) return null;

        // Check if user has any of the specific card
		const userCards = await UserCards.findAll({ where: { user_id: id, dex_id: cardObj.id } });

        // Attach JSON data to each card
		for(let i = 0; i < userCards.length; i++) { userCards[i].data = cardObj; userCards[i].index = i; }
        return userCards;
    }

}