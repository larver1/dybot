const fs = require('fs');
const DbUser = require('../Helpers/DbUser.js');

module.exports = {
    name: "executeCommand",
    async execute(interaction, command) {

		const user = await DbUser.findUser(interaction.user.id);
		if(!user && command.data.name != "profile") return interaction.editReply("You must create a profile to use DyBot. Use `/profile` to begin.").catch(e => {console.log(e)});

		try {	
			await command.execute(interaction, command);
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: 'There was an error while executing this command! Please report this error.', ephemeral: true });
			await dbAccess.add(interaction.user.id, "paused", 0);
		}
    }
}