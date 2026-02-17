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
                if(rand > 0.25) return "Common";
                else return "Uncommon";
            case 4:
                if(rand > 0.78) return "Common";
                else if(rand > 0.36) return "Uncommon";
                else if(rand > 0.06) return "Rare";
                else if(rand > 0.01) return "Legendary";
                else return "Mythical";
            case 5:
                if(rand > 0.75) return "Uncommon";
                else if(rand > 0.22) return "Rare";
                else if(rand > 0.07) return "Legendary";
                else return "Mythical";
            default:
                throw new Error('Invalid slot rarity!');
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
        switch(rarity) {
            case "Common":
                if(goldStarRng < 0.03) resultObj.gold = true;
                else if(goldStarRng < 0.15) resultObj.star = true;
                if(holoRng < ( resultObj.gold ? 0.35 : 0.18 ) ) resultObj.holo = true;
                break;
            case "Uncommon":
                if(goldStarRng < 0.05) resultObj.gold = true;
                else if(goldStarRng < 0.2) resultObj.star = true;
                if(holoRng < ( resultObj.gold ? 0.35 : 0.23 ) ) resultObj.holo = true;
                break;
            case "Rare":
                if(goldStarRng < 0.06) resultObj.gold = true;
                else if(goldStarRng < 0.25) resultObj.star = true;
                if(holoRng < ( resultObj.gold ? 0.35 : 0.28 ) ) resultObj.holo = true;
                break;
            case "Legendary":
                if(goldStarRng < 0.08) resultObj.gold = true;
                else if(goldStarRng < 0.29) resultObj.star = true;
                if(holoRng < ( resultObj.gold ? 0.35 : 0.32 ) ) resultObj.holo = true;
                break;
            case "Mythical":
                if(goldStarRng < 0.1) resultObj.gold = true;
                else if(goldStarRng < 0.35) resultObj.star = true;
                if(holoRng < ( resultObj.gold ? 0.35 : 0.35 ) ) resultObj.holo = true;
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