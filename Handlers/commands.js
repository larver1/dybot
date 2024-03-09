const fs = require('fs');
const { Collection } = require('discord.js');

module.exports = async(client) => {
    // Find all events
    client.commands = new Collection();
    
    // Gets all the folders
    const commandFolder = fs.readdirSync('./commands', { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

    // Adds all the commands in each sub-folder
    for (const folder of commandFolder) {

         // Find all events in each sub folder
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);
            client.commands.set(command.data.name, command);
        }
    }

    console.log(`Cluster ${client.cluster.id}: ✅ COMMANDS LOADED`);
}
