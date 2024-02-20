/**
 * Stores user data assigned to a user's discord ID. One Discord account cannot have more than one User.
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		// User's Discord ID
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        balance: {
            type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: false
        }
	}, {
		timestamps: true,
	});
};