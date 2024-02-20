/**
 * Stores coupons that users can buy with in-game currency.
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('coupons', {
		// Name of the coupon
        coupon_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		// In-game cost of the item
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		// Brief summary of coupon's function
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// The emoji code associated with the coupon
		emoji: {
			type: DataTypes.STRING,
		    allowNull: false,
		},
        // Size of coupon
        size: {
			type: DataTypes.INTEGER,
			allowNull: false,
        },
        // Discount of coupon
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
	}, {
		timestamps: true,
	});
};