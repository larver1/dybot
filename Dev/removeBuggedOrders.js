const DbOrder = require('../Helpers/DbOrder.js');
const { adminId } = require('../config.json');

(async() => {
    const orders = await DbOrder.getUserOrders(adminId, true);
    for(const order of orders) {
        for(const item of order.items) {
            if(item.type == "sketch" || item.type == "lineart") {
                await DbOrder.cancelOrder(order);
                break;
            }
        }
    }
    console.log("Done!");
})();

