const Sequelize = require('sequelize');
const { dbName, dbUser, dbPass } = require('../config.json');

// Initialise a new connection to be referenced in the application
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: 'mysql',  
	// benchmark: true,
	logging: false,
	dialectOptions: {
		connectTimeout: 20000,
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
const Orders = require('./Models/Orders.js')(sequelize, Sequelize.DataTypes);
const UserCoupons = require('./Models/UserCoupons.js')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/Users.js')(sequelize, Sequelize.DataTypes, UserCoupons);

UserCoupons.belongsTo(Coupons, { foreignKey: 'coupon_id', as: 'coupon' });

// Export all models to be accessed in application
module.exports = { Coupons, Orders, UserCoupons, Users, sequelize };