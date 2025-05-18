const fs = require('fs');
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const assets = {};
const cardData = JSON.parse(fs.readFileSync('./Objects/CardData.json'));

async function loadAssets(){
    // Load all card images
    for(const card of cardData) {
        assets[card.id] = {};
        const dir = await fs.readdirSync(`./Assets/Cards/${card.id}`);
        for(const file of dir) {
            if(file.length != 8) throw Error('File name is not in correct format.');
            assets[card.id][file] = await Canvas.loadImage(`./Assets/Cards/${card.id}/${file}`);
        }
        console.log("finished loading cards assets.");
    }
}

loadAssets();


module.exports = class CardCanvas {
    constructor(interaction, cardObj) {
        this.scale = 0.25
        this.width = 768;
        this.height = 1024;
        this.cardObj = cardObj;
        this.attachment;
        this.interaction = interaction;
        return;
    }

    async createCard(){

        // Clear canvas
        this.canvas = Canvas.createCanvas(this.width * this.scale, this.height * this.scale);
        this.ctx = this.canvas.getContext('2d');
        
        // Scale according to given values
        this.ctx.scale(this.scale, this.scale);

        // Apply card template overlay
        await this.addCardTemplate();

        // Draw text on card
        await this.addTextElements();

        this.attachment = new AttachmentBuilder(this.canvas.toBuffer(), 'card.png');   
        return true;   
    }

    async addTextElements(){
        // Set appropriate font and colour
        this.ctx.fillStyle = '#ffffff';

        // No image found
        if(!this.cardObj || !this.cardObj.stats) {
            return new Error(`No card stats on Card.addTextElements()`);
        }

        this.setFont(100);
        this.ctx.fillStyle = "#ff0000";

        // Stats
        await this.displayStat(`${this.cardObj.stats.atk}`, 378 - this.ctx.measureText(`${this.formatStat(this.cardObj.stats.atk)}`).width - 70, 730 + 20);
        await this.displayStat(`${this.cardObj.stats.hp}`, 378 - this.ctx.measureText(`${this.formatStat(this.cardObj.stats.hp)}`).width - 70, 855 + 60);

        await this.displayStat(`${this.cardObj.stats.def}`, 408 + 120, 730 + 20);
        await this.displayStat(`${this.cardObj.stats.luck}`, 408 + 120, 855 + 60);
    }

    async displayStat(text, x, y) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(`${this.formatStat(text)}`, x, y);
    }

    formatStat(value) {
        if(value < 1000)
            return `${value}`;
        if(value < 10000)
            return `${(value / 1000).toFixed(1)}k`;
        if(value < 100000)
            return `${(value / 1000).toFixed(0)}k`;
        if(value < 10000000)
            return `${(value / 100000).toFixed(0)}m`;
    }

    getCardName() {
        this.cardName = "";
        this.cardName += this.cardObj.rarity[0];
        
        if(this.cardObj.details.gold) this.cardName += "G";
        else if(this.cardObj.details.star) this.cardName += "S";
        else this.cardName += "N";

        this.cardName += this.cardObj.details.holo ? "H" : "N";
        this.cardName += this.cardObj.data.first_edition ? "1" : "0";

        if(this.cardName.length != 4) throw Error('Card name not processed correctly.');
    }

    async addCardTemplate(){
        this.getCardName();
        this.ctx.drawImage(assets[this.cardObj.id][`${this.cardName}.png`], 0, 0, this.width, this.height); 
    }

    async setFont(size){
        //Uses specific font
        this.ctx.font = `${size}px Code`;
    }

    getCard(){
        return this.attachment;
    }

}