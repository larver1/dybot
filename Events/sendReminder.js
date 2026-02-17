const { Users } = require('../Database/Objects');
const CustomEmbed = require('../Helpers/CustomEmbed.js');
const config = require('../config.json');

module.exports = {
  name: "sendReminder",
	debug: false,
  async execute(client) {
    console.log("Sending reminders");
    const dybot = await client.users.fetch("1215981694264414419");
		const date = new Date();
		const day = date.getDate() - 1;
		date.setDate(day); 

    // Get all recently active users who have reminders enabled
    const users = await Users.findAll( {
      where: { reminders: true },
    } );

    let usersToRemind = ``;
    const now = new Date();
    for(const dbUser of users) {
      const user = await client.users.fetch(dbUser.user_id);

      // If user has reminders enabled, 1 hour has passed but no more, then remind
      if(this.hasPassedXHours(1, dbUser.last_pack, now) && this.hasPassedXMins(60, dbUser.last_pack, now) && !this.hasPassedXMins(61, dbUser.last_pack, now)) {
        usersToRemind += `${user} `;
      }
    }

    if(!usersToRemind.length) {
      return;
    }

    let reminderMsg = `You can \`/open\` a new pack!\n__If you would like to turn off reminders, use \`/reminder\`__`;
    const dm = new CustomEmbed(null, dybot)
      .setTitle(`A wild reminder appeared!`)
      .setDescription(reminderMsg)

    try {
      const channel = await client.channels.fetch(config.reminderChannelId);
      await channel.send({ embeds: [dm], content: usersToRemind });
      console.log(`Sent reminder to ${usersToRemind} in channel ${config.reminderChannelId}`);
    } catch {
      console.warn(`Failed to send reminder to ${usersToRemind} in channel ${config.reminderChannelId}`);
    }  
  },
	/**
	 * Checks if X hours have passed between two dates
	 * @param {Number} numMins - Number of hours that should have passed
	 * @param {Date} date1 - The older date
	 * @param {Date} date2 - The newer date
	 */
	hasPassedXMins(numMins, date1, date2) {
		if(!date1 || !date2)
			return false;

        const timeDifference = date2.getTime() - date1.getTime();
        const numHoursInMilliseconds = numMins * 60 * 1000; 
      
        return timeDifference >= numHoursInMilliseconds;
    }
}