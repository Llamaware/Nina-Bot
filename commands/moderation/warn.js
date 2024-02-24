const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');
const timezone = require("moment-timezone");

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("warn")
		.setDescription('Create or edit a warning')
		.addSubcommand(subcommand =>
			subcommand.setName('new')
				.setDescription('Issue a warning')
				.addUserOption(option =>
					option.setName('target')
						.setDescription('The user to warn for')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('reason')
						.setDescription('The reason for the warning')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('edit')
				.setDescription('Edit the reason of a warning')
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('The ID of the warning to modify')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('reason')
						.setDescription('The new reason')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('delete')
				.setDescription('Delete a warning')
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('The ID of the warning to delete')
						.setRequired(true))),
	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		const target = interaction.options.getUser('target');
		const id = interaction.options.getInteger('id');
		const reason = interaction.options.getString('reason');

		if (subcommand === 'new') {
			await client.prisma.warning.create({
				data: {
					userId: target.id,
					reason: reason,
					author: interaction.user.tag
				}
			});

			// send a dm to the target
			const dm = await target.createDM();
			await dm.send(`You have been warned in ${interaction.guild.name} for: ${reason}`);

			await interaction.reply({ content: `Issued warning to ${target.tag}`, ephemeral: true });
		}

		if (subcommand === 'edit') {
			await client.prisma.warning.update({
				where: {
					id: id
				},
				data: {
					reason: reason,
					createdAt: new Date()
				}
			});

			await interaction.reply({ content: `Edited warning #${id}`, ephemeral: true });
		}

		if (subcommand === 'delete') {
			await client.prisma.warning.delete({
				where: {
					id: id
				}
			});

			await interaction.reply({ content: `Deleted warning #${id}`, ephemeral: true });
		}
	},
};