module.exports = async(client) => {
    // Find all methods
    const getCommand = require(`../Methods/getCommand`);
    const executeCommand = require(`../Methods/executeCommand`);
    client.getCommand = getCommand.execute;
    client.executeCommand = executeCommand;

    console.log(`Cluster ${client.cluster.id}: ✅ METHODS LOADED`);
}
