const { Users } = require('../Database/Objects');
const DbUserCards = require('../Helpers/DbUserCards');

(async() => {
    await Users.findAll().then( async users => {
        for ( const user of users ) {
            const cards = await DbUserCards.findFilteredUserCards( user.user_id, {} );
            for ( const card of cards ) {
                if(!user.archive.includes(`${card.card_name},`)) {
                    user.archive += `${card.card_name},`;
                    console.log(`User ${user.user_id} was missing ${card.card_name}!`);
                }
            }
            await user.save();
        }
    });
    console.log("Done!");
})();

