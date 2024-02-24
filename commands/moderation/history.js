const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');
const timezone = require("moment-timezone");

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("history")
		.setDescription("Get the moderation history of a user")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user to get the moderation history of")
				.setRequired(true)
		),
	execute: async (interaction, client) => {

		if (!interaction.guild.members.me.permissions.has("EmbedLinks")) return interaction.reply({
			content: "I do not have the **MESSAGE_EMBED_LINKS** permission in this channel.\nPlease enable it."
		});

		const m = await interaction.deferReply({
			fetchReply: true,
		});

		interaction.editReply({ content: 'Fetching...' });

		// Fetch the user's Notes, Warnings, and Bans from the database
		const user = interaction.options.getUser("target");
		const notes = await client.prisma.note.findMany({
			where: {
				userId: user.id,
			},
		});
		const warnings = await client.prisma.warning.findMany({
			where: {
				userId: user.id,
			},
		});
		const bans = await client.prisma.ban.findMany({
			where: {
				userId: user.id,
			},
		});

		console.log(notes, warnings, bans);

		// pain

		// create an embed with the user's notes
		const notesEmbed = new EmbedBuilder()
			.setColor(config.color)
			.setTitle(`Notes for ${user.tag}`)

		if (notes.length === 0) {
			notesEmbed.setDescription("This user has no notes");
		} else {
			notes.forEach((note) => {
				notesEmbed.addFields(
					{ name: `ID: ${note.id}`, value: `**Moderator:** ${note.author}\n**Reason:** ${note.reason}\n**Date:** ${timezone(note.createdAt).tz("America/Chicago").format("MM/DD/YYYY hh:mm A")}` }
				);
			});
		}


		// create an embed with the user's warnings
		const warningsEmbed = new EmbedBuilder()
			.setColor(config.color)
			.setTitle(`Warnings for ${user.tag}`)

		if (warnings.length === 0) {
			warningsEmbed.setDescription("This user has no warnings");
		} else {
			warnings.forEach((warning) => {
				warningsEmbed.addFields(
					{ name: `ID: ${warning.id}`, value: `**Moderator:** ${warning.author}\n**Reason:** ${warning.reason}\n**Date:** ${timezone(warning.createdAt).tz("America/Chicago").format("MM/DD/YYYY hh:mm A")}` }
				);
			});
		}

		// create an embed with the user's bans
		const bansEmbed = new EmbedBuilder()
			.setColor(config.color)
			.setTitle(`Bans for ${user.tag}`)

		if (bans.length === 0) {
			bansEmbed.setDescription("This user has no bans");
		} else {
			bans.forEach((ban) => {
				bansEmbed.addFields(
					{ name: `**ID: ${ban.id}**`, value: `Moderator: ${ban.author}\nReason: ${ban.reason}\nDate: ${timezone(ban.createdAt).tz("America/Chicago").format("MM/DD/YYYY hh:mm A")} CST\nrevoked: ${ban.revoked}` }
				);
			});
		}
		
		//send the embeds
		await interaction.editReply({
			embeds: [notesEmbed, warningsEmbed, bansEmbed]
		});
	}
};
