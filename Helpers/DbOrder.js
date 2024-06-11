const { Orders, OrderItems, Coupons } = require('../Database/Objects');
const fs = require('fs');
const itemTypes = JSON.parse(fs.readFileSync('./Objects/ItemTypes.json'));
const DbUser = require('../Helpers/DbUser.js');
const { Op } = require("sequelize");

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

    static orderAmounts = {
        small: 1,
        medium: 3,
        large: 6,
        xl: 10
    };

    static orderNames = {
        'small': 'Small (x1)',
        'medium': 'Medium (x3)',
        'large': 'Large (x6)',
        'xl': 'Extra Large (x10)'
    };

    static orderStatusEmotes = {
        received: '<:todo:1250076911384924312>',
        started: '<:progress:1250076910336081940>'
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
                size: item.size,
                express: item.express ? item.express : 0
            });
            order.items.push(orderItem);
        }

        // Remove coupon from user
        if(coupon) await user.removeCoupon(coupon, 1);        
        return order;
    }

    /**
     * Returns all orders that are either received or doing
     * @param {Boolean} withItems - Whether to include items in the order
     */
    static async getOrdersInProgress(withItems) {
        const orders = await Orders.findAll({ where: {
            status: {
                [Op.in]: ['received', 'started'],
            }  
        }, order: [['createdAt', 'ASC']] });

        if(withItems) {
            for(const order of orders) {
                order.items = await order.getItems();
            }
        }

        return orders;
    }

    /**
     * Returns number of orders that are either received or doing
     */
    static async getNumOrdersInProgress() {
        const orders = await Orders.count({ where: {
            status: {
                [Op.in]: ['received', 'started'],
            }  
        }});
        
        return orders;
    }

    /**
     * Returns number of emotes that are either received or doing
     */
    static async getNumEmotesInProgress() {
        const orders = await Orders.findAll({ where: {
            status: {
                [Op.in]: ['received', 'started'],
            }  
        }});

        let numEmotes = 0;
            
        // Get all ongoing emotes
        for(const order of orders) {
            numEmotes += await this.getNumEmotesInOrder(order);
        }

        return numEmotes;
    }

    /**
     * Returns number of emotes on an order
     * @param {Orders} order - Order fetched from DB
     */
    static async getNumEmotesInOrder(order) {
        let numEmotes = 0;
        const orderItems = await order.getItems();
        for(const item of orderItems) {
            numEmotes += DbOrder.orderAmounts[item.size];
        }

        return numEmotes;
    }

    /**
     * Returns number of emotes on an order
     * @param {Array} items - All items in an order
     */
    static async getNumEmotesInItems(items) {
        let numEmotes = 0;
        for(const item of items) {
            numEmotes += isNaN(item.size) ? DbOrder.orderAmounts[item.size] : item.size;
        }
        return numEmotes;
    }

    /**
     * Returns number of emotes that are either received or doing
     */
    static async getEmotesInProgress() {
        const orders = await Orders.findAll({ where: {
            status: {
                [Op.in]: ['received', 'started'],
            }  
        }});
         
        // Get all ongoing emotes
        for(const order of orders) {
            order.numEmotes = await this.getNumEmotesInOrder(order);
        }

        return orders;
    }

    /**
     * Returns ongoing express items
     */
    static async getExpressItems() {
        const orders = await this.getOrdersInProgress();
        let items = [];
        
        // Get all ongoing order items
        for(const order of orders) {
            const orderItems = await order.getItems();

            // Count number of express items
            const expressItems = orderItems.filter(item => item.express);
            items.push(...expressItems);
        }

        return items;
    }

    /**
     * Returns number of express items that are part of in-progress orders
     */
    static async getNumExpressSlotsAvailable() {
        const orders = await this.getOrdersInProgress();
        let numExpress = 0;
        
        // Get all ongoing order items
        for(const order of orders) {
            const items = await order.getItems();
            items.map(item => numExpress += item.express);
        }

        return Math.max(3 - numExpress, 0);
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
            if(item.express) {
                cost += DbOrder.getPerEmotePrice(itemPrice) * item.express;
            }
        }
        return cost;
    }

    /**
     * Cancels an order
     * @param {Orders} order 
     */
    static async cancelOrder(order) {
        const user = await DbUser.findUser(order.user_id);
        if(order.coupon_id) await user.addCouponByID(order.coupon_id, 1);
        order.status = 'cancelled';
        await order.save();
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
     * @param {Object} itemData - The order data to search through
     * @param {Any} size - The size of the order
     */
    static getItemPrice(itemData, size) {
		return itemData.prices.find(prices => (prices.size == size) || (DbOrder.orderSizes[prices.size] == size));
    }

    /**
     * Get cost of each emote in an item
     * @param {Object} itemPrice - The item's price object
     */
    static getPerEmotePrice(itemPrice) {
        return itemPrice.cost / itemPrice.size;
    }

    /**
     * Finds item's order and returns it
     * @param {Items} item - Item to check
     */
    static async getItemOrder(item) {
        const order = await Orders.findOne({ where: { order_id: item.order_id }});
        return order;
    }

    /**
     * Get discounted cost off order with a given coupon
     * @param {Number} orderCost - The base cost of the order 
     * @param {Coupons} coupon - The coupon being used
     */
    static getOrderDiscount(orderCost, coupon) {
        return Math.round(orderCost * ((100 - coupon.discount) / 100));
    }

    /**
     * Get a user's orders
     * @param {String} userId - User's ID
     * @param {Boolean} withItems - Whether items should be included
     */
    static async getUserOrders(userId, withItems) {
        const orders = await Orders.findAll({ where: { user_id: userId }, order: [['updatedAt', 'DESC']] });
        
        if(withItems) {
            for(const order of orders) {
                order.items = await order.getItems();
            }
        }
        
        return orders;
    }
}