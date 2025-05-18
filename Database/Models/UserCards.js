/**
 * Stores relationship between a user and a Coupons item. Describes how much of an item a user has.
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_cards', {
		// The number associated with the card for uniqueness
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
		// Description
		desc: {
			type: DataTypes.VIRTUAL,
			get() {
				msg = "";
				if(this.first_edition) msg += `1️⃣`; 
				if(this.gold) msg += `🪙`;
				if(this.star) msg += `🌠`;
				if(this.holo) msg += `🌈`;
				return msg;				
			}
		},
	}, 
	{
	timestamps: true,
	// Use indexes to efficiently retrieve a UserItem using B-Trees
	// Much more efficient than manually searching through the table
	indexes: [
	{
		unique: false,
		fields: ['user_id'],
	},
	{
		unique: false,
		fields: ['card_id'],
	},
	{
		unique: false,
		fields: ['dex_id'],
	},
	{
		unique: false,
		fields: ['user_id', 'card_id'],
	},
	{
		unique: false,
		fields: ['user_id', 'dex_id'],
	},
	],
	});
  };