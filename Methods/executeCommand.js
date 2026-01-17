const fs = require('fs');
const DbUser = require('../Helpers/DbUser.js');

module.exports = {
	name: "executeCommand",
	async execute(interaction, command) {
		const user = await DbUser.findUser(interaction.user.id);
		if(!user && command.data.name != "profile") return interaction.editReply("You must create a profile to use DyBot. Use `/profile` to begin.").catch(e => {console.error(e)});

		// If user has been paused out of commands for too long, unlock them
		if(user && user.paused) {
			if(this.getMinutesBetween(user.updatedAt, new Date()) > 5) {
				user.paused = false;
				await user.save();
			} else {
				return interaction.editReply({ content: `Please wait until your previous command is finished `}).catch(e => console.error(e));
			}
		}

		try {	
			await command.execute(interaction, command);
		} catch (error) {
			console.error(error);
			user.paused = false;
			await user.save();
			await interaction.editReply({ content: 'There was an error while executing this command! Please report this error to Dyron.', ephemeral: true });
		}
    },
	/**
	 * Return number of minutes between two dates
	 * @param {Date} oldDate 
	 * @param {Date} newDate 
	 */
	getMinutesBetween(oldDate, newDate) {
		const diffMs = (newDate - oldDate);
		const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); 
		return diffMins;
	}
}