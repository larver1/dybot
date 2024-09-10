const { Users } = require('../Database/Objects');
const id = "268097383982825474";

(async() => {
    await Users.destroy({ where: { user_id: id } });
    console.log("Done!");
})();

