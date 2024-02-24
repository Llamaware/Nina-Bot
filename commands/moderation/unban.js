const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
} = require("discord.js");
const config = require('../../config.json');

module.exports = {
	category: "Moderation",
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Unban a user from the server")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user to unban")
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionsBitField.BanMembers),
	async execute(interaction, client) {
		const unbanUser = interaction.options.getUser("target");
		const guild = interaction.guild;

		if (
			!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
		)
			return await interaction.reply({
				content: "You do not have permission to use this command",
				ephemeral: true,
			});

		const bans = await guild.bans.fetch();
		const bannedUser = bans.find((ban) => ban.user.id === unbanUser.id);

		if (!bannedUser)
			return await interaction.reply({
				content: "User is not banned",
				ephemeral: true,
			});

		await guild.members.unban(unbanUser.id).catch((err) => {
			interaction.followUp({
				content: "An error occurred while trying to unban the user",
				ephemeral: true,
			});
		});

		const msgEmbed = new EmbedBuilder()
			.setColor(config.color)
			.setDescription(`**${unbanUser.tag}** has been unbanned from the server`);

		await interaction.reply({ embeds: [msgEmbed] });
	},
};
