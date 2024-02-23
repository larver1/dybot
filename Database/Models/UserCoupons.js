/**
 * Stores relationship between a user and a Coupons item. Describes how much of an item a user has.
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_coupons', {
		// Discord user ID
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		// CurrencyShop item ID
		coupon_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		// The amount of the item owned
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
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
		fields: ['coupon_id'],
	},
	{
		unique: false,
		fields: ['user_id', 'coupon_id'],
	},
	],
	});
  };