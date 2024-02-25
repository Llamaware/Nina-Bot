const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const timezone = require("moment-timezone");

module.exports = {
	category: "Misc",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Get bot's real time ping status"),
	execute: async (interaction, client) => {

		if (!interaction.guild.members.me.permissions.has("EmbedLinks")) return interaction.reply({
			content: "I do not have the **MESSAGE_EMBED_LINKS** permission in this channel.\nPlease enable it."
		});

		const m = await interaction.deferReply({
			fetchReply: true,
		});

		const guildData = await client.prisma.guild.findUnique({
			where: {
				id: interaction.guild.id,
			},
			select: {
				embedColor: true,
			},
		});

		interaction.editReply({ content: 'Pinging...' });

		try {
			const embed = new EmbedBuilder()
				.addFields({ name: '⏳ Latency', value: `_**${m.createdTimestamp - interaction.createdTimestamp}ms**_`, inline: true })
				.addFields({ name: '💓 API', value: `_**${client.ws.ping}ms**_`, inline: true })
				.setColor(guildData.embedColor)
				.setFooter({
					text: `Requested by ${interaction.user.username} | Today at ${timezone.tz("America/Chicago").format("HH:mma") + " "}`, iconURL: interaction.user.displayAvatarURL({
						forceStatic: true
					})
				})
			setTimeout(async () => {
				await interaction.editReply({ content: ' ', embeds: [embed] });
			}, 5000);
		} catch (e) {
			const embed = new EmbedBuilder()
				.setDescription(`${e}`)
				.setColor(guildData.embedColor)
			interaction.editReply({ embeds: [embed] })
		}
	}
};
