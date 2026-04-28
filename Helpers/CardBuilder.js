const fs = require('fs');
const cardTypes = JSON.parse(fs.readFileSync('./Objects/CardData.json'));

/**
 * A class to help with messages and reduce duplicate code
 */
module.exports = class CardBuilder {
    static rarityOdds = {
        "1": {
            "Common": 0.75,
            "Uncommon": 0.25
        },
        "2": {
            "Common": 0.75,
            "Uncommon": 0.25
        },
        "3": {
            "Common": 0.75,
            "Uncommon": 0.25
        },
        "4": {
            "Common": 0.22,
            "Uncommon": 0.42,
            "Rare": 0.3,
            "Legendary": 0.05,
            "Mythical": 0.01
        },
        "5": {
            "Uncommon": 0.25,
            "Rare": 0.53,
            "Legendary": 0.15,
            "Mythical": 0.07  
        }
    }

    static cardTypeOdds = {
        "Common": {
            "gold": 0.03,
            "star": 0.12,
            "none": 0.85
        },
        "Uncommon": {
            "gold": 0.05,
            "star": 0.15,
            "none": 0.8
        },
        "Rare": {
            "gold": 0.06,
            "star": 0.19,
            "none": 0.75
        },
        "Legendary": {
            "gold": 0.08,
            "star": 0.21,
            "none": 0.71
        },
        "Mythical": {
            "gold": 0.1,
            "star": 0.25,
            "none": 0.65
        }
    };

    static holoOdds = {
        "Common": {
            "gold": 0.35,
            "none": 0.18
        },
        "Uncommon": {
            "gold": 0.35,
            "none": 0.23
        },
        "Rare": {
            "gold": 0.35,
            "none": 0.28
        },
        "Legendary": {
            "gold": 0.35,
            "none": 0.32
        },
        "Mythical": {
            "gold": 0.35,
            "none": 0.35
        }
    };

    /**
     * @param {UserCards} card 
     */
    static calculatePullOdds(card) {
        let totalRarityOdds = 0;
        let totalCardTypeOdds = 0;
        let totalHoloOdds = 0;
        for (const [slot, rarities] of Object.entries(this.rarityOdds)) {
            for (const [rarity, odds] of Object.entries(rarities)) {
                if(rarity === card.rarity) {
                    totalRarityOdds += odds;

                    if (card.gold) { totalCardTypeOdds += this.cardTypeOdds[rarity].gold; }
                    else if (card.star) { totalCardTypeOdds += this.cardTypeOdds[rarity].star; }
                    else { totalCardTypeOdds += this.cardTypeOdds[rarity].none; }

                    if(card.gold){ totalHoloOdds += card.holo ? 1 - this.holoOdds[rarity].gold : this.holoOdds[rarity].gold }
                    else { totalHoloOdds += card.holo ? 1 - this.holoOdds[rarity].none : this.holoOdds[rarity].none; }
                }
            }
        }
        
        const numSlots = Object.keys(this.rarityOdds).length;
        let averageRarityOdds = totalRarityOdds / numSlots;
        let averageCardTypeOdds = totalCardTypeOdds / numSlots;
        let averageHoloOdds = totalHoloOdds / numSlots;

        return averageRarityOdds * averageCardTypeOdds * averageHoloOdds;
    }
    
    /**
     * Roll a card rarity
     * @param {number} slot
     */
    static rollRarity(slot) {
        const rand = Math.random();
        const rarities = this.rarityOdds[slot];
        let currentOdds = 0.0;
        for (const [rarity, odds] of Object.entries(rarities)) {
            currentOdds += odds;
            if (rand < currentOdds) { return rarity; }
        }
    }

    /**
     * Roll for Gold/Star/Holo card
     * @param {string} rarity
     */
    static rollGoldStarHolo(rarity) {
        const resultObj = { gold: false, star: false, holo: false };
        const goldStarRng = Math.random();
        const holoRng = Math.random();
        
        if (goldStarRng < this.cardTypeOdds[rarity].gold) { resultObj.gold = true; }
        else if (goldStarRng < this.cardTypeOdds[rarity].gold + this.cardTypeOdds[rarity].star) { resultObj.star = true; }
        if (holoRng < this.holoOdds[rarity][`${resultObj.gold ? 'gold' : 'none'}`]) { resultObj.holo = true; }

        return resultObj;
    }

    /**
     * Choose a random card of a given rarity
     * @param {number} slot 
     */
    static pullCard(slot) {    
        const rarity = this.rollRarity(slot);    
        const filteredCards = [...cardTypes.filter( card => card.id && !card.bannedRarities.includes(rarity))];
        const card = {...filteredCards[Math.floor(Math.random() * filteredCards.length)]};
        card.rarity = rarity;
        card.details = this.rollGoldStarHolo( card.rarity);
        return card;
    }

    /**
     * Pulls various cards and outputs as array
     * @param {Number} numCards 
     */
    static openPack(numCards = 5) {
        const pack = [];
        for(let i = 0; i < numCards; i++) pack.push(this.pullCard(i + 1));
        return pack;
    }
}