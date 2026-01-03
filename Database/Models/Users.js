module.exports = (sequelize, DataTypes, UserCoupons) => {
	/**
	 * Stores user data assigned to a user's discord ID. One Discord account cannot have more than one User.
	 */
	const Users = sequelize.define('users', {
		// User's Discord ID
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		balance: {
			type: DataTypes.INTEGER,
			get() {
				return `\`💰${this.getDataValue('balance').toLocaleString('en-US', { style: 'decimal' })}\``;
			},
			set(value) {
				this.setDataValue('balance', parseInt(value));
			},
			defaultValue: 0,
			allowNull: false,
		},
		leaderboard: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		},
		paused: {
			type: DataTypes.INTEGER,
			defaultValue: false,
			allowNull: false
		},
		first_pack: {
			type: DataTypes.DATE,
			defaultValue: null
		},
		last_pack: {
			type: DataTypes.DATE,
			defaultValue: new Date("December 17, 1995 03:24:00"),
			allowNull: false
		},
		level: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
		}
	}, {
		timestamps: true,
	});

	/**
	 * Pause a user
	 * @param {string} id - User's discord ID.
	 */
	Users.prototype.pause = async function() {
		this.paused = true;
		await this.save();
		return this;
	}

	/**
	 * Unpause a user
	 * @param {string} id - User's discord ID.
	 */
	Users.prototype.unpause = async function() {
		this.paused = false;
		await this.save();
		return this;
	}

	/**
	 * Give money to user
	 * @param {Number} amount - Amount of money to add
	 */
	Users.prototype.giveMoney = async function(amount) {
		try {
			if(isNaN(amount) || !Number.isInteger(amount)) throw new Error(`Amount of money must be a number`);
			if(amount <= 0) throw new Error(`Cannot add negative amount of money.`);
	
			this.setDataValue('balance', bal + amount);
			await this.save();
			return true;
		} catch {
			return false;
		}
	};

	/**
	 * Take money off user
	 * @param {Number} amount - Amount of money to remove
	 */
	Users.prototype.takeMoney = async function(amount) {
		try {
			const bal = this.getDataValue('balance');
			if(isNaN(amount) || !Number.isInteger(amount)) throw new Error(`Amount of money must be a number`);
			if(amount <= 0) throw new Error(`Cannot take away negative amount of money.`);
			if(amount > bal) return false;
	
			this.setDataValue('balance', bal - amount);
			await this.save();
			return true;
		} catch {
			return false;
		}
	};

	/**
	 * Gives the user an coupon
	 * @param {Coupons} coupon - Coupon from CurrencyShop
	 * @param {Number} freq - Amount of coupon to add
	 */
	Users.prototype.addCoupon = async function(coupon, freq) {
		const userCoupon = await UserCoupons.findOne({ where: { user_id: this.user_id, coupon_id: coupon.coupon_id } });
			if (userCoupon) {
				userCoupon.amount += freq;
				return userCoupon.save();
			}

		return UserCoupons.create({ user_id: this.user_id, coupon_id: coupon.coupon_id, amount: freq});
	};

	/**
	 * Gives the user an coupon
	 * @param {Coupons} coupon - Coupon from CurrencyShop
	 * @param {Number} freq - Amount of coupon to add
	 */
	Users.prototype.addCouponByID = async function(couponId, freq) {
		const userCoupon = await UserCoupons.findOne({ where: { user_id: this.user_id, coupon_id: couponId } });
			if (userCoupon) {
				userCoupon.amount += freq;
				return userCoupon.save();
			}

		return UserCoupons.create({ user_id: this.user_id, coupon_id: couponId, amount: freq});
	};

	/**
	 * Removes an coupon from the user
	 * @param {Coupons} coupon - Coupon from CurrencyShop
	 * @param {Number} freq - Amount of coupon to remove
	 */
	Users.prototype.removeCoupon = async function(coupon, freq) {
		const userCoupon = await UserCoupons.findOne({
			where: { user_id: this.user_id, coupon_id: coupon.coupon_id },
		});

		if(freq <= 0 || userCoupon.amount < freq) 
			return null;
		
		if (userCoupon) {
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
		const userCoupon = await UserCoupons.findOne({ where: { user_id: this.user_id, coupon_id: coupon.coupon_id } });
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
	Users.prototype.getCoupons = async function() {
		const coupons = await UserCoupons.findAll({
			where: { user_id: this.user_id },
			include: ['coupon'],
		});
		return coupons.filter(coupon => coupon.amount > 0)
	};

	/**
	 * Gets all of the user's coupons
	 */
	Users.prototype.getCouponsOfValue = async function(value) {
		const allCoupons = await this.getCoupons();
		return allCoupons.filter(userCoupon => userCoupon.coupon.value == value && userCoupon.amount > 0);
	};

	/**
	 * Gets all of the user's coupons
	 */
	Users.prototype.displayCoupons = async function() {
		let msg = `None`;
		const coupons = await this.getCoupons();
		if(coupons.length) {
			msg = coupons.map(i => `- ${i.coupon.emoji} x${i.amount} ${i.coupon.name}(s)`);
			msg = msg.join("\n");
		}
		return msg;
	};

	/**
	 * Checks if user owns Coupons coupon and returns the UserCoupons
	 * @param {Coupons} coupon - Coupon from Coupons
	 */
	Users.prototype.getCoupon = function(coupon) {
		return UserCoupons.findOne({
			where: { user_id: this.user_id, coupon_id: coupon.coupon_id },
		});
	};

	/**
	 * Checks if user has an coupon by name and returns it
	 * @param {string} couponName - Name of Coupons coupon
	 */
	Users.prototype.getCouponByName = async function(couponName) {
		const coupon = await Coupons.findOne({ where: { name: couponName } });
		if(!coupon) return;

		const userCoupon = await UserCoupons.findOne({ where: { user_id: this.user_id, coupon_id: coupon.coupon_id } });
		if(!userCoupon) return;

		userCoupon.coupon = coupon;
		return userCoupon;
	};

	/**
	 * Checks if user can open a pack
	 */
	Users.prototype.canOpenPack = function() {
        if(!this.last_pack) return true;
        const now = new Date();
        const timeDifference = now.getTime() - this.last_pack.getTime();
        const numHoursInMilliseconds = 6 * 60 * 60 * 1000; 
        return timeDifference >= numHoursInMilliseconds;
	};

	/**
	 * Checks if user can open a pack
	 */
	Users.prototype.resetPackTimer = async function() {
		const now = new Date();
		this.last_pack = now;
		await this.save();
	};
	

	return Users;
}