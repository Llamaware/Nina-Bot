const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const timezone = require("moment-timezone");

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("notes")
		.setDescription('Create or edit a note')
		.addSubcommand(subcommand =>
			subcommand.setName('new')
				.setDescription('Create a new note')
				.addUserOption(option =>
					option.setName('target')
						.setDescription('The user to create a note for')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('reason')
						.setDescription('The reason for the note')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('edit')
				.setDescription('Edit the reason of a note')
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('The ID of the note to modify')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('reason')
						.setDescription('The new note')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('delete')
				.setDescription('Delete a note')
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('The ID of the note to delete')
						.setRequired(true))),
	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const target = interaction.options.getUser('target');
		const id = interaction.options.getInteger('id');
		const reason = interaction.options.getString('reason');

		if (subcommand === 'new') {
			await client.prisma.note.create({
				data: {
					userId: target.id,
					reason: reason,
					author: interaction.user.tag
				}
			});

			//pull notes from db
			const notes = await client.prisma.note.findMany({
				where: {
					userId: target.id
				}
			});

			const guildData = await client.prisma.guild.findUnique({
				where: {
					id: interaction.guild.id,
				},
				select: {
					embedColor: true,
				},
			});

			//create embed
			const notesEmbed = new EmbedBuilder()
				.setColor(guildData.embedColor)
				.setTitle(`Notes for ${target.tag}`)

			if (notes.length === 0) {
				notesEmbed.setDescription("This user has no notes");
			} else {
				notes.forEach((note) => {
					notesEmbed.addFields(
						{ name: `ID: ${note.id}`, value: `**Moderator:** ${note.author}\n**Reason:** ${note.reason}\n**Date:** ${timezone(note.createdAt).tz("America/Chicago").format("MM/DD/YYYY hh:mm A")}` }
					);
				});
			}

			await interaction.reply({
				embeds: [notesEmbed]
			});
		}

		if (subcommand === 'edit') {
			await client.prisma.note.update({
				where: {
					id: id,
				},
				data: {
					reason: reason,
					createdAt: new Date()
				},
			});

			await interaction.reply({ content: `Edited note with ID ${id}`, ephemeral: true });
		}

		if (subcommand === 'delete') {
			await client.prisma.note.delete({
				where: {
					id: id,
				},
			});

			await interaction.reply({ content: `Deleted note with ID ${id}`, ephemeral: true });
		}
	},
};