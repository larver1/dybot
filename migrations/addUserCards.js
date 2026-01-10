'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('UserCards', {
		card_id: {
            type: DataTypes.INTEGER,
			primaryKey: true,
            autoIncrement: true,
		},
		// Discord user ID
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// The ID of card they own
		dex_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		// If the card is favourited
		fav: {
			type: DataTypes.BOOLEAN,
			defaultValue: 0
		},
		// Rarity of card
		rarity: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// Star
		star: {
			type: DataTypes.BOOLEAN,
			allowNull: 0,
		},
		gold: {
			type: DataTypes.BOOLEAN,
			allowNull: 0,
		},
		// Holo
		holo: {
			type: DataTypes.BOOLEAN,
			defaultValue: 0
		},
		// Level of card
		lvl: {
			type: DataTypes.INTEGER,
			defaultValue: 1
		},
		// First edition
		first_edition: {
			type: DataTypes.BOOLEAN,
			defaultValue: 0
		},
		// If in tradebox
		in_tradebox: {
			type: DataTypes.BOOLEAN,
			defaultValue: 0
		},
		// Name
		name: {
			type: DataTypes.STRING,
			get() {
				return CardData[parseInt(this.dex_id) - 1].name;
			}
		},
		// Emoji
		emoji: {
			type: DataTypes.STRING,
			get() {
				return CardData[parseInt(this.dex_id) - 1].emote;
			}
		},
		// Card Data
		data: {
			type: DataTypes.JSON,
			get() {
				return CardData[parseInt(this.dex_id) - 1];
			}
		}
    });
  }
};