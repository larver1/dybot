const { Orders } = require('../Database/Objects');

const orderSizes = {
    1: 'small',
    3: 'medium',
    6: 'large',
    10: 'xl'
};

/**
 * Interface for performing DB operations to a user.
 */
module.exports = class dbOrder {

    /**
	 * Creates a user with the given ID and tag
	 * @param {string} id - User's discord ID.
	 * @param {string} tag - User's discord tag
	 */
    static async createOrder(userId, orderType, orderAmount, coupon) {
        const order = await Orders.create({
            user_id: userId,
            type: orderType.value,
            size: orderSizes[orderAmount],
            coupon_id: coupon ? coupon.coupon_id : 0,
            status: 'received'
        });
        return order;
    }
}