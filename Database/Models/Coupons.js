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
			get() {
				return `💰${this.getDataValue('cost').toLocaleString('en-US', { style: 'decimal' })}`;
			},
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
        // Value of coupon
        value: {
            type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 20
        },
        // Discount of coupon
        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
	}, {
		timestamps: true,
	});
};