const { Users } = require('../Database/Objects');
const id = "268097383982825474";

(async() => {
    const user = await Users.destroy({ where: { user_id: id } });
    await user.destroy();
    console.log("Done!");
})();

