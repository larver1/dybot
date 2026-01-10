const { Collection } = require('discord.js');
const { Commands } = require('../Database/Objects');

module.exports = {
    name: "getCommand",
    async execute(interaction, commandName, ignoreCooldown, ignoreDefer) {
        const command = interaction.client.commands.get(commandName);
        if (!command) return null;
    
        if(!interaction.deferred && !interaction.replied && !ignoreDefer) {
            const now = new Date();
            try {
                await interaction.deferReply();
                if(!interaction.deferred) throw new Error('Interaction was not deferred');        
            } catch (error) {   
                console.error(`Error deferring reply to command\nGuild ID: ${interaction.guildId}\nCommand Name: ${interaction.commandName}\n`);
                const createTime = new Date(interaction.createdTimestamp);
                console.error(`Milliseconds since interaction create: ${now.getTime() - createTime.getTime()}`);
                console.trace();
                return;
            }
        } 
    
        // Check if command is locked.
        const dbCommand = await Commands.findOne({ where: { commandName: commandName } });
        if(dbCommand && dbCommand.locked && interaction.user.id != interaction.client.config.adminId)
        {
            if(interaction.deferred || interaction.replied)
                await interaction.editReply(`This command is currently locked. Please try later.`).catch(e => {console.log(e)});
            else
                await interaction.reply(`This command is currently locked. Please try later.`).catch(e => {console.log(e)});
            return null;
        }

        if(!interaction.client.cooldowns.has(command.data.name))
            interaction.client.cooldowns.set(command.data.name, new Collection());
    
        // Handle command cooldowns
        const now = Date.now();
        const timestamps = interaction.client.cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 1) * 1000;
    
        // Check if command is off cooldown
        if(!ignoreCooldown && timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    
            if(now < expirationTime)
            {
                const timeLeft = (expirationTime - now) / 1000;
                    if(interaction.deferred || interaction.replied)
                        await interaction.editReply(`Please wait ${timeLeft.toFixed(2)} seconds before using this command again.`).catch(e => {console.error(e)});
                    else
                        await interaction.reply(`Please wait ${timeLeft.toFixed(2)} seconds before using this command again.`).catch(e => {console.error(e)});	
                return null;
            }
        }
    
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    
        // If successful, give command object
        return command;
    }
}