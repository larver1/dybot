const fs = require('fs');
const cardTypes = JSON.parse(fs.readFileSync('./Objects/CardData.json'));

/**
 * A class to help with messages and reduce duplicate code
 */
module.exports = class CardBuilder {
    /**
     * Roll a card rarity
     */
    static rollRarity() {
        const rand = Math.random();
        if(rand > 0.40) return "Common";
        else if (rand > 0.10) return "Uncommon";
        else return "Rare";
    }

    /**
     * Choose a random card of a given rarity
     * @param {string} rarity 
     */
    static pullCard(rarity = this.rollRarity()) {
        const cards = cardTypes.filter(card => card.rarity == rarity);
        
        return cards[Math.floor(Math.random() * cards.length)];
    }

    /**
     * Pulls various cards and outputs as array
     * @param {Number} numCards 
     */
    static openPack(numCards = 5) {
        const pack = [];
        const rarities = ["Common", "Common", "Uncommon", "Uncommon", "Rare"];
        for(let i = 0; i < numCards; i++) pack.push(this.pullCard(rarities[i]));
        return pack;
    }
}