const config = require("../config.json");
const { ActivityType } = require("discord.js");

module.exports = async (client) => {

	client.user.setPresence({
		status: "idle"
	});

	function randomstatus() {

		let status = [
			`Always watching ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Members 👥`,
		];

		let rstatus = Math.floor(Math.random() * status.length);

		client.user.setActivity(status[rstatus], {
			type: ActivityType.Custom
		});

	};
	setInterval(randomstatus, 15000);

	client.logger.log(`> 🔍 • Check All Server is ${client.guilds.cache.size} Server 🌐`, "info");
	client.logger.log(`> ✅ • Successfully logged on as ${client.user.username}\n\n======================================`, "success");

};
