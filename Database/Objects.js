const Sequelize = require('sequelize');
const { dbName, dbUser, dbPass, debug } = require('../config.json');

// Initialise a new connection to be referenced in the application
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: 'mysql',  
	// benchmark: true,
	logging: false,
	dialectOptions: {
		connectTimeout: 20000,
		socketPath: debug ? null : "/var/run/mysqld/mysqld.sock"
	},
	pool: {
		max: 50,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
});

// Require all models to be exported
const Coupons = require('./Models/Coupons.js')(sequelize, Sequelize.DataTypes);
const OrderItems = require('./Models/OrderItems.js')(sequelize, Sequelize.DataTypes);
const Orders = require('./Models/Orders.js')(sequelize, Sequelize.DataTypes, OrderItems);
const UserCoupons = require('./Models/UserCoupons.js')(sequelize, Sequelize.DataTypes);
const UserCards = require('./Models/UserCards.js')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/Users.js')(sequelize, Sequelize.DataTypes, UserCoupons);
const Commands = require('./Models/Commands.js')(sequelize, Sequelize.DataTypes, UserCoupons);

UserCoupons.belongsTo(Coupons, { foreignKey: 'coupon_id', as: 'coupon' });
OrderItems.belongsTo(Orders, { foreignKey: 'order_id', as: 'item' });

// Export all models to be accessed in application
module.exports = { Coupons, Orders, OrderItems, UserCoupons, UserCards, Users, Commands, sequelize };