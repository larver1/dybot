const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');
const CustomCollector = require('../../Helpers/CustomCollector.js');
const DbUserCards = require('../../Helpers/DbUserCards.js');
const CardCanvas = require('../../Helpers/CardCanvas.js');

/**
 * @param {SlashCommandBuilder} data - Command data.
 * @param {string} section - Category the command belongs to.
 * @param {Number} cooldown - The time a user must wait before repeating the command.
 * @param {string} usage - Information to guide players how to use the command.
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Read about different aspects of the TCG.')
        .addStringOption(topic =>
            topic.setName('topic')
            .setDescription('The topic you wish to read about.')
            .addChoices(
                { name: 'Rarity', value: 'rarity'},
                { name: 'Type', value: 'type'},
            )
            .setRequired(true)
        )
        .addStringOption(detail =>
            detail.setName('detail')
            .setDescription('A specific detail you want to read about.')
            .setRequired(false)
        ),
    help: `Allows you to read about different aspects of the TCG.`,
	/**
	 * Runs when command is called
	 * @param {CommandInteraction} interaction - User's interaction with bot.
	 */
	async execute(interaction) {
        const topic = interaction.options.getString('topic');
        const detail = interaction.options.getString('detail');

        return interaction.editReply(`WIP`).catch(e => console.error(e));
    },
}