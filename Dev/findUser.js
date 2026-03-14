const { Users } = require('../Database/Objects');
let args = process.argv.slice(2);
let userId = args[0];

(async() => {
    const user = await Users.findOne({ where: { user_id: userId } });
    console.log(user);
})();

