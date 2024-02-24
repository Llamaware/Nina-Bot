const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');
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

			await interaction.reply({ content: `Created note for ${target.tag}`, ephemeral: true });
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