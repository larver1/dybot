const Canvas = require('canvas');
const Card = require("./CardCanvas");
const { AttachmentBuilder } = require('discord.js');

module.exports = class CardsView {
    constructor(interaction, cardsToDisplay) {
        this.cardsToDisplay = cardsToDisplay;
        this.numCards = this.cardsToDisplay.length;
        this.dimensions = Card.getCardDimensions();
        this.overlap = 100;
        this.width = ((this.dimensions.width - this.overlap) * this.numCards) + (300 * (this.dimensions.scale));
        this.height = this.dimensions.height;
        this.scale = this.dimensions.scale;

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
            this.ctx.drawImage(card.canvas, (i * (this.dimensions.width - (i ? this.overlap : 0))) * this.scale, 0, card.width * card.scale, card.height * card.scale);
        }

        this.attachment = new AttachmentBuilder(this.canvas.toBuffer(), 'cards.png');
        return true;
    }

    getCards(){
        return this.attachment;
    }

}