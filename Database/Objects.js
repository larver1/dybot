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
const Users = require('./Models/Users.js')(sequelize, Sequelize.DataTypes);
const Coupons = require('./Models/Coupons.js')(sequelize, Sequelize.DataTypes);
const Orders = require('./Models/Orders.js')(sequelize, Sequelize.DataTypes);
const UserCoupons = require('./Models/UserCoupons.js')(sequelize, Sequelize.DataTypes);

UserCoupons.belongsTo(Coupons, { foreignKey: 'coupon_id', as: 'coupon' });

/**
 * Gives the user an coupon
 * @param {Coupons} coupon - Coupon from CurrencyShop
 * @param {Number} freq - Amount of coupon to add
 */
Users.prototype.addCoupon = async function(coupon, freq) {
	const userCoupon = await UserCoupons.findOne({ where: { user_id: this.user_id, coupon_id: coupon.id } });
		if (userCoupon) {
			userCoupon.amount += freq;
			return userCoupon.save();
		}

	return UserCoupons.create({ user_id: this.user_id, coupon_id: coupon.id, amount: freq});
};

/**
 * Removes an coupon from the user
 * @param {Coupons} coupon - Coupon from CurrencyShop
 * @param {Number} freq - Amount of coupon to remove
 */
Users.prototype.removeCoupon = async function(coupon, freq) {
	const userCoupon = await UserCoupons.findOne({
		where: { user_id: this.user_id, coupon_id: coupon.id },
	});

	if (userCoupon && userCoupon.amount > 0) {
		if(!freq) userCoupon.amount -= 1;
		else userCoupon.amount -= freq;
		return userCoupon.save();
	} else {
		return null;
	}
};

/**
 * Sets the amount of coupon a user has
 * @param {Coupons} coupon - Coupon from Coupons
 * @param {Number} freq - Amount of coupon to set
 */
Users.prototype.setCoupon = async function(coupon, freq) {
	const userCoupon = await UserCoupons.findOne({ where: { user_id: this.user_id, coupon_id: coupon.id } });
	if (userCoupon && userCoupon.amount) {
		userCoupon.amount = freq;
		return userCoupon.save();
	} else {
		return null;
	}
};

/**
 * Gets all of the user's coupons
 */
Users.prototype.getCoupons = function() {
	return UserCoupons.findAll({
		where: { user_id: this.user_id },
		include: ['coupon'],
	});
};

/**
 * Checks if user owns Coupons coupon and returns the UserCoupons
 * @param {Coupons} coupon - Coupon from Coupons
 */
Users.prototype.getCoupon = function(coupon) {
	return UserCoupons.findOne({
		where: { user_id: this.user_id, coupon_id: coupon.id },
	});
};

/**
 * Checks if user has an coupon by name and returns it
 * @param {string} couponName - Name of Coupons coupon
 */
Users.prototype.getCouponByName = async function(couponName) {
	const coupon = await Coupons.findOne({ where: { name: couponName } });
	if(!coupon) return;

	const userCoupon = await UserCoupons.findOne({ where: { user_id: this.user_id, coupon_id: coupon.id } });
	if(!userCoupon) return;

	userCoupon.coupon = coupon;
	return userCoupon;
};

// Export all models to be accessed in application
module.exports = { Coupons, Orders, UserCoupons, Users, sequelize };