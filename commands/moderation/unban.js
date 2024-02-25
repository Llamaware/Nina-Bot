const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
} = require("discord.js");

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

		//find all bans for the user that are marked as not revoked, and revoke them
		const userBans = await client.prisma.ban.findMany({
			where: {
				userId: unbanUser.id,
				revoked: false,
			},
		});
		
		for (const ban of userBans) {
			await client.prisma.ban.update({
				where: {
					id: ban.id,
				},
				data: {
					revoked: true,
				},
			});
		}

		const guildData = await client.prisma.guild.findUnique({
			where: {
				id: interaction.guild.id,
			},
			select: {
				embedColor: true,
			},
		});

		const msgEmbed = new EmbedBuilder()
			.setColor(guildData.embedColor)
			.setDescription(`**${unbanUser.tag}** has been unbanned from the server`);

		await interaction.reply({ embeds: [msgEmbed] });
	},
};
