const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbed = require('../../Helpers/CustomEmbed.js');
const DbUser = require('../../Helpers/DbUser.js');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { Users, Coupons } = require('../../Database/Objects.js');
const tickEmoji = "✅";
const crossEmoji = "❌";

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer')
		.setDescription('Offer points to a user.')
        .addUserOption(user =>
            user.setName('user')
            .setDescription('The user to give to.')
            .setRequired(true)
        )
        .addIntegerOption(amount =>
            amount.setName('amount')
            .setDescription('The number of points you wish to give.')
            .setRequired(true)
        ),
    section: "General",
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const mentioned = interaction.options.getUser('user');

        const user = await DbUser.findUser(interaction.user.id);
        const targetUser = await DbUser.findUser(mentioned.id);
        if(!targetUser) return interaction.editReply(`No user is found with ID ${mentioned.id}`);

        // Check if amount being transferred is valid
        if(amount == null || amount <= 0) return interaction.editReply(`You must give a positive amount of DyDots.`).catch(e => { console.log(e)});
        if(amount > user.getDataValue('balance') ) return interaction.editReply(`You cannot transfer \`💰${amount}\` as you only have \`${user.balance}\`.`).catch(e => { console.log(e)});

		// if(interaction.user == mentioned)
		// 	return interaction.editReply(`You can't transfer money to yourself...`).catch(e => { console.log(e)});

        // Ask target user if they wish to accept the money
        let transferEmbed = new CustomEmbed(interaction)
            .setTitle(`Transfering DyDots to ${mentioned.tag}`)
            .setDescription(`${mentioned}, do you accept the \`💰${amount}\` offered by ${interaction.user}?`)
            .setColor(`Blue`)

        let acceptId = uuidv4();
        let declineId = uuidv4();
  
		const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(acceptId)
				.setLabel(`Accept`)
				.setEmoji(`${tickEmoji}`)
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(declineId)
				.setLabel('Decline')
				.setEmoji(`${crossEmoji}`)
				.setStyle(ButtonStyle.Secondary)
		);

        await interaction.editReply( { embeds: [transferEmbed], components: [row]} ).catch(e => console.log(e));
        await interaction.followUp(`${mentioned}`).catch(e => console.log(e));

        const filter = i => i.user.id === mentioned.id && (i.customId == acceptId || i.customId == declineId);
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000, errors: ['time']  });

        collector.on('collect', async i => {
            if(i.customId == acceptId)
            {
                await i.deferUpdate().catch(e => {console.log(e)});
                transferEmbed.setDescription(`${mentioned} has accepted \`💰${amount}\` from ${interaction.user}.`);
             
                let newMoney1 = await Users.findOne({ where: { user_id: interaction.user.id } });
                newMoney1 = newMoney1.getDataValue('balance');
                let newMoney2 = await Users.findOne({ where: { user_id: mentioned.id } });
                newMoney2 = newMoney2.getDataValue('balance');

                // Anti-exploit check to determine if balance has changed since pressing accept
                if(newMoney1 != user.getDataValue('balance') || newMoney2 != targetUser.getDataValue('balance'))
                {
                    //await dbAccess.add(interaction.user.id, "paused", 0);
                    transferDone = true;
                    return interaction.editReply(`The transfer could not go through, as one user's balance has changed.`).catch(e => { console.log(e)});
                }

                user.setDataValue('balance', user.getDataValue('balance') - amount);
                targetUser.setDataValue('balance', targetUser.getDataValue('balance') + amount);
                await user.save();
                await targetUser.save();
                await interaction.editReply( {embeds: [transferEmbed], components: []} ).catch(e => console.log(e));
                transferDone = true;
            } 
            // Transfer declined
            else if(i.customId == declineId)
            {
                await i.deferUpdate().catch(e => {console.log(e)});
                transferEmbed.setDescription(`${mentioned} has declined the \`💰${amount}\` offered by ${interaction.user}.`);
                await interaction.editReply( {embeds: [transferEmbed], components: []} ).catch(e => console.log(e));
                transferDone = true;
            }

           // await dbAccess.add(interaction.user.id, "paused", 0);
        });

         // No response from user
        collector.on('end', async () => {
            if(!transferDone)
            {
                transferEmbed.setDescription(`The offer received no response...`);
                // await dbAccess.add(interaction.user.id, "paused", 0);
                await interaction.editReply({embeds: [transferEmbed], components: [] }).catch(e => { console.log(e)});	
                return;
            }
        });
	}
}