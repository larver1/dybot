const fs = require('fs');
const { debug } = require('../config.json');

module.exports = async(client) => {
    // Find all events
    const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`../Events/${file}`);
        if(!debug && event.debug)
            continue;
        
        if(event.once) 
            client.once(event.name, (...args) => event.execute(...args, client));
        else 
            client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`Cluster ${client.cluster.id}: ✅ EVENTS LOADED`);
}
