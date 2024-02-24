const { Orders, OrderItems } = require('../Database/Objects');
const fs = require('fs');
const itemTypes = JSON.parse(fs.readFileSync('./Objects/ItemTypes.json'));

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

    static orderNames = {
        'small': 'Small (x1)',
        'medium': 'Medium (x3)',
        'large': 'Large (x6)',
        'xl': 'Extra Large (x10)'
    };

    /**
	 * Creates a user with the given ID and tag
	 * @param {Users} user - User fetched from DB
	 * @param {string} tag - User's discord tag
	 */
    static async createOrder(user, orderItems, coupon) {
        // Create the order
        const order = await Orders.create({
            user_id: user.user_id,
            coupon_id: coupon ? coupon.coupon_id : 0,
            status: 'received'
        });
        order.items = [];

        // Create each item involved in the order
        for(const item of orderItems) {
            const orderItem = await OrderItems.create({
                order_id: order.order_id,
                type: item.type,
                size: item.size
            });
            order.items.push(orderItem);
        }

        // Remove coupon from user
        if(coupon) await user.removeCoupon(coupon, 1);        
        return order;
    }

    /**
     * Total cost of every item in an order
     * @param {Array} items - Items in the order 
     */
    static getTotalOrderCost(items) {
        let cost = 0;
        for(const item of items) {
            const itemData = DbOrder.getItemData(item.type);
            const itemPrice = DbOrder.getItemPrice(itemData, item.size);
            cost += itemPrice.cost;
        }
        return cost;
    }

    /**
     * Find order object data by order type
     * @param {string} itemType - The type of order to search for 
     */
    static getItemData(itemType) {
		return itemTypes.find(item => item.value == itemType);
    }

    /**
     * Get order price
     * @param {Object} orderData - The order data to search through
     * @param {Any} size - The size of the order
     */
    static getItemPrice(itemData, size) {
		return itemData.prices.find(prices => (prices.size == size) || (DbOrder.orderSizes[prices.size] == size));
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