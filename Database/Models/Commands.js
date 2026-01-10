/**
 * Stores the bot's command names and whether they can currently be used.
 */
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('commands', {
		// Name of the command
		commandName: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		// Whether the command can be used by players
		// Locked in events where a command is bugged and/or is being used for exploits.
		locked: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		}
	}, {
		timestamps: false,
	});
};