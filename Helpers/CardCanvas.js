const fs = require('fs');
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const assets = {};
const cardData = JSON.parse(fs.readFileSync('./Objects/CardData.json'));

async function loadAssets(){
    // Load all card images
    for(const card of cardData) {
        if(!assets[card.name]) assets[card.name] = {};
        assets[card.name][card.rarity] = await Canvas.loadImage(`./Assets/Cards/${card.name}/${card.rarity}.png`);
    }
}

loadAssets();


module.exports = class CardCanvas {
    constructor(interaction, card) {
        this.scale = 0.25
        this.width = 768;
        this.height = 1024;
        this.card = card;
        this.cardObj = card.data;
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

        this.ctx.fillStyle = "#ff0000";

        // Stats
        this.setFont(60);
        await this.displayStat(`Lv.${this.card.lvl}`, 378 - this.ctx.measureText(`Lv.${this.card.lvl}`).width + 270, 125);

        this.setFont(100);
        await this.displayStat(`${this.cardObj.stats.atk}`, 378 - this.ctx.measureText(this.cardObj.stats.atk).width - 70, 730 + 20);
        await this.displayStat(`${this.cardObj.stats.hp}`, 378 - this.ctx.measureText(this.cardObj.stats.hp).width - 70, 855 + 60);

        await this.displayStat(`${this.cardObj.stats.def}`, 408 + 120, 730 + 20);
        await this.displayStat(`${this.cardObj.stats.luck}`, 408 + 120, 855 + 60);
    }

    async displayStat(text, x, y) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(text, x, y);
    }

    async addCardTemplate(){
        this.ctx.drawImage(assets[this.cardObj.name][this.cardObj.rarity], 0, 0, this.width, this.height); 
    }

    async setFont(size){
        this.ctx.font = `${size}px Code`;
    }

    getCard(){
        return this.attachment;
    }

}