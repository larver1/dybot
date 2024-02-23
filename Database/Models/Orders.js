
/**
 * Stores all orders
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('orders', {
		// Order ID
		order_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		// ID of user who ordered
		user_id: {
			type: DataTypes.STRING,
		},
		// ID of coupon type they used (if any)
		coupon_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0
		},
        // Status of the order
        status: {
            type: DataTypes.ENUM('received', 'started', 'complete', 'cancelled'),
			allowNull: false,
            defaultValue: 'received'
        },
        type: {
            type: DataTypes.ENUM('sketch', 'lineart', 'colorblack', 'colorcolor', 'animated'),
            allowNull: false,
            defaultValue: 'sketch'
        },
		size: {
            type: DataTypes.ENUM('small', 'medium', 'large', 'xl'),
            allowNull: false,
            defaultValue: 'small'
        }
	}, {
		timestamps: true,
		indexes: [
			{
				unique: false,
				fields: ['user_id'],
			},
			{
				unique: false,
				fields: ['order_id'],
			},
			{
				unique: false,
				fields: ['user_id', 'order_id'],
			},
			],
	});
};