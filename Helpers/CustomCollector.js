const { v4: uuidv4 } = require('uuid');
const CustomEmbed = require('../Helpers/CustomEmbed.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const tickEmoji = "<a:tick:886245262169866260>";
const crossEmoji = "<a:cross:886245292339515412>";
const prevPageEmoji = "<:leftarrow:709828405952249946>";
const nextPageEmoji = "<:rightarrow:709828406048587806>";
const fs = require('fs');

/**
 * A class to help with defining collectors to reduce duplicate code
 */
module.exports = class CustomCollector {

    /**
     * Define a collector which will allow adding components
     * @param {CommandInteraction} interaction - User's interaction with the bot
     * @param {Object} options - Configurations for the collector
     * @param {Function} callbackFn - The function to call when an interaction is collected
     */
    constructor(interaction, options, callbackFn) {
        this.interaction = interaction;
        this.options = options;
        this.callbackFn = callbackFn;

        this.embeds = [];
        this.components = [];
    }

    /**
     * Adds a button to the collector message
     * @param {String} label - The label of the button
     * @param {ButtonStyle} type - The type of button
     * @param {Function} callbackFn - The function to call when button is pressed
     * @param {String} emoji - The emoji to show
     */
    createButton(label, type, callbackFn, emoji) {
        const button = new ButtonBuilder()
            .setCustomId(uuidv4())
            .setLabel(label)
            .setStyle(type)

        button.callbackFn = callbackFn;
        if(emoji) button.setEmoji(emoji);
        return button;
    }

    /**
     * Adds a row of buttons
     * @param {Array} buttons - All the buttons to add to the row 
     */
    addButtonRow(buttons) {
        this.components.push(new ActionRowBuilder().addComponents(buttons));
    } 
    
    /**
     * Adds an embed to the display message
     * @param {String} title - The embed title
     * @param {String} description - The embed description
     */
    addEmbed(title, description) {
        const embed = new CustomEmbed(this.interaction)
            .setTitle(title)
            .setDescription(description)

        embed.customId = uuidv4();
        this.embeds.push(embed);
        return embed;
    }

    /**
     * Adds a select menu from data passed in
     * @param {Array} data - Data passed in 
     * @param {Function} callbackFn - The function to call when an item is selected
     */
    addSelectMenu(data, callbackFn) {
        let selectionList = [];
        selectionList[0] = [];
        let page = 0;
        let count = 0;
        
        for(let i = 0; i < data.length; i++) {
            // Each SelectMenu can only have 25 items, so start a new page
            count++;
            if(count > 25) {
                console.log(i);
                page++; 
                selectionList.push([]);
                count = 1;
            } 

			// Add item to SelectMenu
			selectionList[page].push({
				label: data[i].label,
				description: data[i].description,
				value: data[i].value ? `${data[i].value}` : `${i}`
			});
        }

        this.page = 0;
        this.maxPages = selectionList.length;

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(uuidv4())
            .setPlaceholder(`[Page ${this.page + 1}/${this.maxPages}] Select an Option`)
            .addOptions(selectionList[0])
        selectMenu.selectionList = selectionList;
        selectMenu.callbackFn = callbackFn;

        this.components.push(new ActionRowBuilder().addComponents(selectMenu));

        // If multiple pages are required, add buttons
        if(selectionList.length > 1) {
            this.addButtonRow([
                this.createButton('Prev Page', ButtonStyle.Secondary, async() => {
                    // Update page number
					if(this.page > 0) this.page--;
					else this.page = this.maxPages - 1;

                    // Find select menu, and update its options
                    const selectMenuIndex = this.components.findIndex(component => component.customId == selectMenu.customId);
                    this.components[selectMenuIndex].components[0]
                        .setOptions(selectMenu.selectionList[this.page])
                        .setPlaceholder(`[Page ${this.page + 1}/${this.maxPages}] Select an Option`);

                    this.message = await this.interaction.editReply({ content: `Collector has updated`, embeds: this.embeds, components: this.components }).catch(e => console.log(e));   
                }, prevPageEmoji),
                this.createButton('Next Page', ButtonStyle.Secondary, async() => {
                    // Update page number
                    if(this.page < this.maxPages - 1) this.page++;
                    else this.page = 0;

                    // Find select menu, and update its options
                    const selectMenuIndex = this.components.findIndex(component => component.customId == selectMenu.customId);
                    this.components[selectMenuIndex].components[0]
                        .setOptions(selectMenu.selectionList[this.page])
                        .setPlaceholder(`[Page ${this.page + 1}/${this.maxPages}] Select an Option`);

                    this.message = await this.interaction.editReply({ content: `Collector has updated`, embeds: this.embeds, components: this.components }).catch(e => console.log(e));
                }, nextPageEmoji)
            ]);
        }
    }

    /**
     * Displays an embed with changing descriptions on each page
     * @param {String} title - Embed title 
     * @param {Array} descriptionList - List of descriptions to display depending on page number 
     */
    addEmbedPages(title, descriptionList) {
        this.page = 0;
        this.maxPages = descriptionList.length;
        const embed = this.addEmbed(`[Page ${this.page + 1}/${this.maxPages}] ${title}`, descriptionList[this.page]);
        embed.descriptionList = descriptionList;
        
        if(descriptionList.length > 1) {
            // If multiple pages are required, add buttons
            this.addButtonRow([
                this.createButton('Prev Page', ButtonStyle.Secondary, async() => {
                    // Update page number
                    if(this.page > 0) this.page--;
                    else this.page = this.maxPages - 1;

                    // Find embed, and update its description
                    const embedIndex = this.embeds.findIndex(currentEmbed => currentEmbed.customId == embed.customId);
                    this.embeds[embedIndex]
                        .setTitle(`[Page ${this.page + 1}/${this.maxPages}] ${title}`)
                        .setDescription(embed.descriptionList[this.page])

                    this.message = await this.interaction.editReply({ content: `Collector has updated`, embeds: this.embeds, components: this.components }).catch(e => console.log(e));   
                }, prevPageEmoji),
                this.createButton('Next Page', ButtonStyle.Secondary, async() => {
                    // Update page number
                    if(this.page < this.maxPages - 1) this.page++;
                    else this.page = 0;

                    // Find embed, and update its description
                    const embedIndex = this.embeds.findIndex(currentEmbed => currentEmbed.customId == embed.customId);
                    this.embeds[embedIndex]
                        .setTitle(`[Page ${this.page + 1}/${this.maxPages}] ${title}`)
                        .setDescription(embed.descriptionList[this.page])

                    this.message = await this.interaction.editReply({ content: `Collector has updated`, embeds: this.embeds, components: this.components }).catch(e => console.log(e));  
                }, nextPageEmoji)
            ]);
        }
    }

    /**
     * Adds a preset confirmation message
     * @param {String} action - The action you are warning the user of
     * @param {String} description - The description of the embed
     * @param {Object} callbacks - The key-value object of callback functions
     */
    addConfirmationMessage(actionMsg, description, callbacks) {

        // Add warning embed
        this.addEmbed(`Are you sure you want to ${actionMsg}?`, description);

        // Add yes/no buttons
		this.addButtonRow([
            this.createButton('Decline', ButtonStyle.Danger, callbacks['decline'], crossEmoji),
			this.createButton('Confirm', ButtonStyle.Primary, callbacks['confirm'], tickEmoji)
		]);

        // User can only confirm/decline once
        this.options.max = 1;
    }

    /**
     * Adds all the component IDs that the filter should listen for
     */
    async initFilter() {
        this.componentIds = this.components.reduce((result, obj) => {
            obj.components.forEach(component => {
                const id = component.data.custom_id;
                result[id] = component.callbackFn;
            });
            return result;
        }, {});    
    }

    /**
     * Checks if interaction passes filter checks
     * @param {CommandInteraction} i - User's interaction with the component 
     */
    checkFilter(i) {
        const idArray = Object.keys(this.parent.componentIds);
        return i.user.id == this.parent.interaction.user.id && (idArray.includes(i.customId));
    }

    /**
     * Displays message and attaches collector to it
     */
    async init() {
        this.initFilter();
        this.message = await this.interaction.editReply({ content: `Collector has started`, embeds: this.embeds, components: this.components }).catch(e => console.log(e));   
        this.collector = this.message.createMessageComponentCollector({ 
            filter: this.checkFilter, 
            time: this.options.time ? this.options.time : 300_000, 
            errors: ['time'],
            max: this.options.max ? this.options.max : null
        });
        this.collector.parent = this;
    }

    /**
     * Starts listening for interactions
     */
    async start() {

        await this.init();
        this.collector.on('collect', async i => {
            await i.deferUpdate().catch(e => {console.log(e)});
            this.callbackFn(i);
            this.componentIds[i.customId](i);
        });
        this.collector.on('end', async collected => {
			if(collected.size <= 0) {
				return this.interaction.editReply({ content: "The command timed out.", components: [], embeds: [] }).catch(e => console.log(e));	
			} else {
                return this.interaction.editReply({ components: [] }).catch(e => console.log(e));
            }
        });
    }
 
}