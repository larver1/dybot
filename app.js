const { Client, GatewayIntentBits, Partials , Options, Collection} = require('discord.js');
const config = require('./config.json');
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');

// Init client
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions
	],
	partials: [
		Partials.Channel,
		Partials.Message
	],
	sweepers: {
		...Options.DefaultSweeperSettings,
		// Sweep messages from cache
		messages: {
			// 2 minute-old messages are removed
			interval: 60 * 10,
			// Sweep cache every 5 minutes
			lifetime: 60 * 5
		}
	},
	allowedMentions: { parse: ['users', 'roles'] }
});

client.cluster = new ClusterClient(client);
if(client.cluster.maintenance) console.log(`Bot on maintenance mode: ${client.cluster.maintenance}.`);

// Init commands
client.cooldowns = new Collection(); 
client.config = config;

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	
    client.user.setUsername('DyBot');
	client.user.setActivity('/help');

    init();
	console.log("Shard ready");
});

client.cluster.on('ready', () => {  
	console.log("Cluster Ready");
});


async function init() {
	// Load Commands and Events
	require("./Handlers/commands")(client);
	require("./Handlers/events")(client);
	require("./Handlers/methods")(client);	
}

client.login(config.token);