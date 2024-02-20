
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
        // Status of the order
        order_status: {
            type: DataTypes.ENUM('received', 'started', 'complete', 'cancelled'),
			allowNull: false,
            defaultValue: 'received'
        },
        order_type: {
            type: DataTypes.ENUM('sketch', 'lineart', 'colorblack', 'colorcolor', 'animated'),
            allowNull: false,
            defaultValue: 'sketch'
        }
	}, {
		timestamps: true,
	});
};