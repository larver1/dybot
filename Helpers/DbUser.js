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
	 * @param {string} tag - User's discord tag
	 */
    static async createUser(id, tag) {
        const user = await Users.create({
            user_id: id,
            balance: 100,
            tag: tag
        });
        return user;
    }
}