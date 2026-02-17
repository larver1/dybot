const { Users } = require('../Database/Objects');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const CustomEmbed = require('../Helpers/CustomEmbed.js');

module.exports = {
  name: "sendReminder",
	debug: false,
  async execute(client) {
    console.error("sending reminder");
		const date = new Date();
		const day = date.getDate() - 1;
		date.setDate(day); 

    // Get all recently active users who have reminders enabled
    const users = await Users.findAll( {
      where: { reminders: true },
    } );

    const now = new Date();

    for(const dbUser of users) {
      const user = await client.users.fetch(dbUser.user_id);

      // If user has reminders enabled, 1 hour has passed but no more, then remind
      if(!(this.hasPassedXHours(1, dbUser.last_pack, now) && this.hasPassedXMins(60, dbUser.last_pack, now) && !this.hasPassedXMins(61, dbUser.last_pack, now))) {
        return;
      }
  
      let reminderMsg = `You can \`/open\` a new pack!\n__If you would like to turn off reminders, use \`/reminder\`__`;
      const dm = new CustomEmbed(null, user)
        .setTitle(`A wild reminder appeared!`)
        .setDescription(reminderMsg)

      try {
        await user.send({ embeds: [dm], components: [] });
        console.log(`Sent reminder to ${dbUser.user_id}`);
      } catch {
        console.warn(`Failed to send reminder to ${user.tag}`);
      }
      await sleep(5000);
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