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
		},
		// The type of card they own
		dex_id: {
			type: DataTypes.INTEGER,
		},
		// Level of card
		lvl: {
			type: DataTypes.INTEGER,
			defaultValue: 1
		},
		// Atk IV of card
		atk_iv: {
			type: DataTypes.INTEGER,
			defaultValue: Math.ceil(Math.random() * 10)
		},
		// Def IV of card
		def_iv: {
			type: DataTypes.INTEGER,
			defaultValue: Math.ceil(Math.random() * 10)
		},
		// HP IV of card
		hp_iv: {
			type: DataTypes.INTEGER,
			defaultValue: Math.ceil(Math.random() * 10)
		},
		// Luck IV of card
		luck_iv: {
			type: DataTypes.INTEGER,
			defaultValue: Math.ceil(Math.random() * 10)
		},
		// The amount of the item owned
		first_edition: {
			type: DataTypes.BOOLEAN,
			defaultValue: 0
		}
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