
/**
 * Stores all orders
 */
module.exports = (sequelize, DataTypes, OrderItems) => {
	const Orders = sequelize.define('orders', {
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

	/**
	 * Gets all of the order's items
	 */
	Orders.prototype.getItems = async function() {
		const items = await OrderItems.findAll({
			where: { order_id: this.order_id },
			include: ['item'],
		});
		return items;
	};
	
	return Orders;

};