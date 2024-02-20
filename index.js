const { ClusterManager, ReClusterManager, HeartbeatManager } = require('discord-hybrid-sharding');
const { token } = require('./config.json');

/**
 * Main file which spawns multiple Discord clients (shards) to handle traffic across many servers
 * Each shard accommodates for ~1000 servers
 * A cluster can have multiple shards, each cluster is an independent process.
 * Clusters are used to divide the work across multiple cores
 */

const options = { 
	totalShards: 'auto',
	shardsPerClusters: 3,
	token: token,
	respawn: true,
	spawnOptions: {
		delay: 7000, 
		timeout: 60000 
	},
	restartMode: 'gracefulSwitch',
	restarts: {
		max: 5,
		interval: 300000 * 60,
	}
};

const manager = new ClusterManager('./app.js', options);
manager.extend(new ReClusterManager());
manager.extend(new HeartbeatManager({
	interval: 30000,
	maxMissedHeartbeats: 5,
}));

manager.on('debug', console.log);
manager.on('clusterCreate', async cluster => {
	console.log(`Launched cluster ${cluster.id}`);
	cluster.on('message', async message => {
		if(message.content && message.content == 'restart') {
			const restartAttempt = await restart();
			if(restartAttempt.success) {
				await manager.broadcast({content: "restartFinish" });
			}
		}
	});
});


// Spawn clients with specified options
async function start() {
	await manager.spawn({ delay: 7000, timeout: 60000 }).catch(e => console.log(e));   
}

// Called when dev command "/restart" is used
// Recompiles new clients and then switches old clients with new ones when they are ready
// Allows seamless restart to allow deployment of changes with only a few seconds of actual downtime
async function restart() {
	console.log("Performing graceful restart.");
	const restart = await manager.recluster?.start(options);

	console.log("Finished graceful restart.");
	return restart;
}

start();