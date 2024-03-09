const { Users } = require('../Database/Objects');

/**
 * Interface for performing DB operations to a user.
 */
module.exports = class DbUser {

	/**
	 * Fetches user with unique Discord ID.
	 * @param {string} id - User's discord ID.
	 */
    static async findUser(id, attributes) {
		const user = await Users.findOne({ where: { user_id: id }, attributes: attributes });
		if(!user) return null;
		
		return user;
    }

    /**
	 * Creates a user with the given ID and tag
	 * @param {string} id - User's discord ID.
	 * @param {Boolean} leaderboard - Whether user wishes to be shown on the leaderboard
	 */
    static async createUser(id, leaderboard) {
        const user = await Users.create({
            user_id: id,
            balance: 0,
            leaderboard: leaderboard
        });
        return user;
    }

    /**
     * Fetch all users in order of balance
     */
    static async getTopUsers() {
        return Users.findAll({ 
            order: [['balance', 'DESC']],
        });
    }
}