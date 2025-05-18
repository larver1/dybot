const Canvas = require('canvas');
const Card = require("./CardCanvas");
const { AttachmentBuilder } = require('discord.js');

module.exports = class CardsView {
    constructor(interaction, cardsToDisplay) {
        this.scale = 0.20;
        this.width = 3472;
        this.height = 1224;
        this.cardsToDisplay = cardsToDisplay;
        this.numCards = this.cardsToDisplay.length;

        this.canvas = Canvas.createCanvas(this.width * this.scale, this.height * this.scale);
        this.ctx = this.canvas.getContext('2d');

        this.attachment;
        this.interaction = interaction;      
        return;
    }

    async createCards(){

        for(let i = this.numCards - 1; i >= 0; i--) {

            let char = this.cardsToDisplay[i];

            // Create card out of bot
            let card = await new Card(this.interaction, char);
            card.scale = this.scale;
            await card.createCard();

            // Draw card on canvas
            this.ctx.drawImage(card.canvas, i * (this.canvas.width / this.numCards) - 20 * this.scale, 0, card.width * card.scale, card.height * card.scale);
        }

        this.attachment = new AttachmentBuilder(this.canvas.toBuffer(), 'cards.png');
        return true;
    }

    getCards(){
        return this.attachment;
    }

}