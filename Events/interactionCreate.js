module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
			// Check conditions are valid to use a command
			if(!interaction.isCommand()) return;
			if(interaction.user.bot) return;
			if(!interaction.channel) await interaction.user.createDM();

			// Try to get command
			const command = await client.getCommand(interaction, interaction.commandName);
			if(!command) return;

			// Fire command executor
			await client.executeCommand.execute(interaction, command).catch(e => console.error(e));
    }
}