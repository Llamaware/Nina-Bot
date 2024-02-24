const {EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const config = require('../../config.json');
const packageJSON = require("../../package.json");
const discordJSVersion = packageJSON.dependencies["discord.js"];
const timezone = require("moment-timezone");
const moment = require("moment");
require("moment-duration-format");
const ms = require("ms");
const os = require("node:os");
const packageJson = require("../../package.json");

module.exports = {
	category: "Misc",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Show the bot statistics"),
	execute: async (interaction, client) => {

		if (!interaction.guild.members.me.permissions.has("EmbedLinks")) return interaction.reply({
			content: "I do not have the **MESSAGE_EMBED_LINKS** permission in this channel.\nPlease enable it."
		});

		try {
			const duration = moment.duration(client.uptime).format("**D [D], H [H], m [M], s [S]**");

			const embed = new EmbedBuilder()
				.setTitle(`⚙ • System Statistics`)
				.setThumbnail(client.user.displayAvatarURL())
				.setColor(config.color)
				.setDescription(`
\`\`\`asciidoc
• Platform - Arch     :: ${process.platform} - ${process.arch}
• Bot Uptime          :: ${duration}
• Memory Usage        :: ${formatBytes(process.memoryUsage.rss())}
• Process Uptime      :: ${ms(Math.round(process.uptime() * 1000), { long: true })}
• OS Uptime           :: ${ms(os.uptime() ?? 0, { long: true })}
• Node.js version     :: ${process.version}
• Discord.js version  :: v${discordJSVersion}
• Bot Version         :: v${packageJson.version}
\`\`\`
            `)
				.setFooter({
					text: `Requested by ${interaction.user.username} | Today at ${timezone.tz("Asia/Jakarta").format("HH:mma") + " "}`, iconURL: interaction.user.displayAvatarURL({
						forceStatic: true
					})
				})
			interaction.reply({ embeds: [embed] })
		} catch (e) {
			const embed = new EmbedBuilder()
				.setDescription(`${e}`)
				.setColor(config.color)
			interaction.reply({ embeds: [embed] })
		}
	}
};

function formatBytes(bytes) {
	if (bytes === 0) return "0 Bytes";
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};
