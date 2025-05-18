const fs = require('fs');
const cardTypes = JSON.parse(fs.readFileSync('./Objects/CardData.json'));

/**
 * A class to help with messages and reduce duplicate code
 */
module.exports = class CardBuilder {
    /**
     * Roll a card rarity
     * @param {number} slot
     */
    static rollRarity(slot) {
        const rand = Math.random();
        switch(slot) {
            case 1:
            case 2:
            case 3:
                if(rand > 0.30) return "Common";
                else return "Uncommon";
            case 4:
                if(rand > 0.60) return "Uncommon";
                else if(rand > 0.005) return "Rare";
                else return "Legendary";
            case 5:
                if(rand > 0.0105) return "Rare";
                else if(rand > 0.0005) return "Legendary";
                else return "Mythical";
            default:
                throw new Error('Invalid slot rarity!');
        }
    }

    /**
     * Roll for Gold/Star/Holo card
     * @param {number} slot
     */
    static rollGoldStarHolo(slot) {
        const resultObj = { gold: false, star: false, holo: false };
        switch(slot) {
            case 1:
            case 2:
            case 3:
                if(Math.random() < 0.005) resultObj.gold = true;
                else if(Math.random() < 0.05) resultObj.star = true;
                if(Math.random() < 0.05) resultObj.holo = true;
                break;
            case 4:
                if(Math.random() < 0.01) resultObj.gold = true;
                else if(Math.random() < 0.05) resultObj.star = true;
                if(Math.random() < 0.05) resultObj.holo = true;
                break;
            case 5:
                if(Math.random() < 0.02) resultObj.gold = true;
                else if(Math.random() < 0.08) resultObj.star = true;
                if(Math.random() < 0.10) resultObj.holo = true;
                break;
            default:
                throw new Error('Invalid slot rarity!');
        }
        return resultObj;
    }

    /**
     * Choose a random card of a given rarity
     * @param {number} slot 
     */
    static pullCard(slot) {        
        const card = {...cardTypes[Math.floor(Math.random() * cardTypes.length)]};
        card.rarity = this.rollRarity(slot);
        card.details = this.rollGoldStarHolo(slot);
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