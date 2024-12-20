const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'toggles.json');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('toggle')
		.setDescription('Toggle express slots.')
        .addStringOption(order =>
            order.setName('order')
            .setDescription('Choose whether to change all orders or just express.')
            .addChoices(
                { name: 'Orders', value: 'orders'},
                { name: 'Express', value: 'express'},   
            )					  
            .setRequired(true)
        )
        .addStringOption(type =>
            type.setName('type')
            .setDescription('Choose whether to turn the option on or off.')
            .addChoices(
                { name: 'On', value: 'on'},
                { name: 'Off', value: 'off'},   
            )					  
            .setRequired(true)
        ),
    section: "Admin",
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {

        if(interaction.client.config.adminId != interaction.user.id)
            return interaction.editReply({ content: `You do not have permission to use this command.` }).catch(e => console.log(e));

        // Check if user chose 'on' or 'off'
        const orderType = interaction.options.getString('order');
        const isOn = interaction.options.getString('type') == 'on';
        
        // Update toggle file with bool
        await this.updateJsonFile(orderType, isOn);
        await interaction.editReply({ content: `**${orderType}** ➡️ **${isOn ? 'activated': 'deactivated'}**.` }).catch(e => console.log(e));
    },
    // Function to update a value in the JSON file
    async updateJsonFile(key, value) {
        try {
            // Step 1: Read the JSON file
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            // Step 2: Parse the file content to a JavaScript object
            const data = JSON.parse(fileContent);
            
            // Step 3: Modify the value
            data[key] = value;
        
            // Step 4: Convert the object back to a JSON string
            const updatedJson = JSON.stringify(data, null, 2); // Indentation for readability
            
            // Step 5: Write the updated JSON back to the file
            fs.writeFileSync(filePath, updatedJson, 'utf8');
            
            console.log(`Updated ${key} to ${value} successfully!`);
        } catch (error) {
            console.error('Error updating JSON file:', error);
        }
    }
}