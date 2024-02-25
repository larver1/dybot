
/**
 * Stores all order items
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('order_items', {
		// Item ID
		item_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		order_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
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
				fields: ['item_id'],
			},
			{
				unique: false,
				fields: ['order_id'],
			},
			{
				unique: false,
				fields: ['item_id', 'order_id'],
			},
		],
	});
};