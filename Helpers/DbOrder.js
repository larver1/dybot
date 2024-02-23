const { Orders } = require('../Database/Objects');
const fs = require('fs');
const orderTypes = JSON.parse(fs.readFileSync('./Objects/OrderTypes.json'));

/**
 * Interface for performing DB operations to a user.
 */
module.exports = class DbOrder {

    static orderSizes = {
        1: 'small',
        3: 'medium',
        6: 'large',
        10: 'xl'
    };

    /**
	 * Creates a user with the given ID and tag
	 * @param {Users} user - User fetched from DB
	 * @param {string} tag - User's discord tag
	 */
    static async createOrder(user, orderType, orderAmount, coupon) {
        const order = await Orders.create({
            user_id: user.user_id,
            type: orderType.value,
            size: DbOrder.orderSizes[orderAmount],
            coupon_id: coupon ? coupon.coupon_id : 0,
            status: 'received'
        });

        if(coupon) await user.removeCoupon(coupon, 1);        
        return order;
    }

    /**
     * Find order object data by order type
     * @param {string} orderType - The type of order to search for 
     */
    static getOrderData(orderType) {
		return orderTypes.find(order => order.value == orderType);
    }

    /**
     * Get order price
     * @param {Object} orderData - The order data to search through
     * @param {Any} size - The size of the order
     */
    static getOrderPrice(orderData, size) {
		return orderData.prices.find(prices => (prices.size == size) || (DbOrder.orderSizes[prices.size] == size));
    }

    /**
     * Get discounted cost off order with a given coupon
     * @param {Number} orderCost - The base cost of the order 
     * @param {Coupons} coupon - The coupon being used
     */
    static getOrderDiscount(orderCost, coupon) {
        return Math.round(orderCost * ((100 - coupon.discount) / 100));
    }
}