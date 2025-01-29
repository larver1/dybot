const { UserCards } = require('../Database/Objects');
const id = "184717700239589377";

(async() => {
    await UserCards.create({ user_id: id, dex_id: 1 })
    console.log("Done!");
})();

