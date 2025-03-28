const Sequelize = require('sequelize');
const { dbName, dbUser, dbPass, debug } = require('../config.json');
const conn = {};

const fs = require('fs');
const couponData = JSON.parse(fs.readFileSync('./Objects/Coupons.json'));

// Initialise connection with DB before performing operations
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: 'mysql',  
	logging: false,
	dialectOptions: {
		connectTimeout: 20000,
		socketPath: debug ? null : "/var/run/mysqld/mysqld.sock"
	},
	retry: {
		match: [
			/ETIMEDOUT/,
			/EHOSTUNREACH/,
			/ECONNRESET/,
			/ECONNREFUSED/,
			/ETIMEDOUT/,
			/ESOCKETTIMEDOUT/,
			/EHOSTUNREACH/,
			/EPIPE/,
			/EAI_AGAIN/,
			/SequelizeConnectionError/,
			/SequelizeConnectionRefusedError/,
			/SequelizeHostNotFoundError/,
			/SequelizeHostNotReachableError/,
			/SequelizeInvalidConnectionError/,
			/SequelizeConnectionTimedOutError/
		],
		max: 5
	}
});

conn.sequelize = sequelize;
conn.Sequelize = Sequelize;
module.exports = conn;

const Coupons = require('../Database/Models/Coupons.js')(sequelize, Sequelize.DataTypes);
require('../Database/Models/Orders.js')(sequelize, Sequelize.DataTypes);
require('../Database/Models/OrderItems.js')(sequelize, Sequelize.DataTypes);
require('../Database/Models/UserCoupons.js')(sequelize, Sequelize.DataTypes);
require('../Database/Models/Users.js')(sequelize, Sequelize.DataTypes);

const force = true;

// Syncs up the DB when new items have been added to CurrencyShop, or new commands have been added
sequelize.sync({ force }).then(async () => {
	const shop = [];
	for(const coupon of couponData) {
		await Coupons.upsert({
			name: coupon.name,
			cost: coupon.cost,
			description: coupon.description,
			emoji: coupon.emoji,
			value: coupon.value,
			discount: coupon.discount
		});
	}
	await Promise.all(shop);
	sequelize.close();
}).catch(console.error);