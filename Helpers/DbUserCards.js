const { UserCards, Users } = require('../Database/Objects');
const fs = require('fs');
const CardData = JSON.parse(fs.readFileSync('./Objects/CardData.json'));
const { Op } = require("sequelize");

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
        return CardData.find(card => card.name.toLowerCase() === name.toLowerCase());
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

        return userCards;
    }

    /**
     * Fetches all cards with given filters
     * @param {string} id 
     * @param {Object} filters 
     */
    static async findFilteredUserCards(id, filters) {
        const query = {user_id: id};
        if(filters.name) {
            const cardId = this.findCardByName(filters.name)?.id;
            if(cardId) query.dex_id = cardId;
            else query.dex_id = 99999; // Make invalid ID so that nothing shows
        } 
        if(filters.rarity) query.rarity = filters.rarity;
        if(filters.type) { 
            switch(filters.type) {
                case "normal": query.star = false; query.gold = false; break;
                case "gold": query.gold = true; query.star = false; break;
                case "star": query.star = true; query.gold = false; break;
                default: break;
            } 
        }
        if(filters.holo) query.holo = filters.holo == 'yes' ? true : false;
        if(filters.minlevel || filters.maxlevel) query.lvl = {}
        if(filters.minlevel) query.lvl[Op.gte] = filters.minlevel;
        if(filters.maxlevel) query.lvl[Op.lte] = filters.maxlevel;
        if(filters.favourited) query.fav = filters.favourited == 'yes' ? true : false;
        if(filters.tradebox) query.in_tradebox = filters.tradebox == 'yes' ? true : false;

        return UserCards.findAll({ where: query });
    }

    /**
     * Adds card of ID to user
     * @param {Number} userId - User's ID
     * @param {Object} card - Card's details
     */
    static async giveUserCard(userId, card) {
        if(card.details.star && card.details.gold) throw Error('Card can\'t be both gold and star');
        const dbCard = await UserCards.create({ 
            user_id: userId, 
            dex_id: parseInt(card.id),
            rarity: card.rarity,
            star: card.details.star,
            gold: card.details.gold,
            holo: card.details.holo,
            lvl: 1,
            first_edition: true
        });

        const user = await Users.findOne({ where: { user_id: userId }, attributes: [ 'user_id', 'first_pack', 'archive' ] });
        if (!user.first_pack) {
            user.first_pack = new Date();
            await user.save();
        }

        if(!user.archive.includes(`${dbCard.card_name},`)) {
            user.archive += `${dbCard.card_name},`;
            await user.save();
        }

        return dbCard;
    }

    static async changeOwnerOfCards(cards, newId) {
        for ( const card of cards ) {
            card.user_id = newId;
            await card.save();
            const user = await Users.findOne({ where: { user_id: newId }, attributes: [ 'user_id', 'archive' ] });
            if(!user.archive.includes(`${card.card_name},`)) {
                user.archive += `${card.card_name},`;
                await user.save();
            }
        }
    }

    /**
     * Adds card of ID to user
     * @param {Number} userId - User's ID
     * @param {Object} card - Card's details
     */
    static async updateUserCard(card, changes) {     
        if(Object.hasOwn(changes, "fav")) { card.fav = changes.fav; }
        if(Object.hasOwn(changes, "tradebox")) { card.in_tradebox = changes.tradebox; }
        return card.save();
    }
}