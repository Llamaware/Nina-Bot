const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
} = require("discord.js");
const config = require('../../config.json');

module.exports = {
	category: "Moderation",
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban a user from the server")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user to ban")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("reason").setDescription("The reason for the ban")
		)
		.setDefaultMemberPermissions(PermissionsBitField.BanMembers),
	async execute(interaction, client) {
		const banUser = interaction.options.getUser("target");
		const banMember = await interaction.guild.members.fetch(banUser.id);
		const channel = interaction.channel;

		// Acknowledge the interaction immediately
		await interaction.deferReply();

		if (
			!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
		)
			return await interaction.followUp({
				content: "You do not have permission to use this command",
				ephemeral: true,
			});

		if (!banMember)
			return await interaction.followUp({
				content: "User not found",
				ephemeral: true,
			});
		if (!banMember.bannable)
			return await interaction.followUp({
				content: "I cannot ban this user",
				ephemeral: true,
			});

		const reason =
			interaction.options.getString("reason") || "No reason provided";
		
		// Add the ban to prisma
		await client.prisma.ban.create({
			data: {
				userId: banUser.id,
				reason: reason,
				author: interaction.user.tag,
				revoked: false,
			},
		});

		const dmEmbed = new EmbedBuilder()
			.setColor(config.color)
			.setDescription(
				`You have been banned from **${interaction.guild.name}**\n**Reason:** ${reason}`
			);

		await banMember.send({ embeds: [dmEmbed] }).catch((err) => {
			console.error(err);
		});

		await banMember.ban({ reason }).catch((err) => {
			console.error(err);
			interaction.followUp({
				content: "An error occurred while trying to ban the user",
				ephemeral: true,
			});
		});

		const msgEmbed = new EmbedBuilder()
			.setColor(config.color)
			.setDescription(
				`**${banUser.tag}** has been banned from the server\n**Reason:** ${reason}`
			);

		await interaction.followUp({ embeds: [msgEmbed] });
	},
};
