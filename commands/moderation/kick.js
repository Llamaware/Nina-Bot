const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
} = require("discord.js");

module.exports = {
	category: "Moderation",
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("Kick a user from the server")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user to kick")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName("reason").setDescription("The reason for the kick")
		)
		.setDefaultMemberPermissions(PermissionsBitField.KickMembers),
	async execute(interaction, client) {
		const kickUser = interaction.options.getUser("target");
		const kickMember = await interaction.guild.members.fetch(kickUser.id);
		const channel = interaction.channel;

		if (
			!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
		)
			return await interaction.reply({
				content: "You do not have permission to use this command",
				ephemeral: true,
			});

		if (!kickMember)
			return await interaction.reply({
				content: "User not found",
				ephemeral: true,
			});
		if (!kickMember.kickable)
			return await interaction.reply({
				content: "I cannot kick this user",
				ephemeral: true,
			});

		const reason =
			interaction.options.getString("reason") || "No reason provided";

		const guildData = await client.prisma.guild.findUnique({
			where: {
				id: interaction.guild.id,
			},
			select: {
				embedColor: true,
			},
		});

		const dmEmbed = new EmbedBuilder()
			.setColor(guildData.embedColor)
			.setDescription(`You have been kicked from **${interaction.guild.name}**\n**Reason:** ${reason}`)

		const msgEmbed = new EmbedBuilder()
			.setColor(guildData.embedColor)
			.setDescription(`**${kickUser.tag}** has been kicked from the server\n**Reason:** ${reason}`)

		await kickMember.send({ embeds: [dmEmbed] }).catch(err => {
			console.error(err);
			return;
		});

		await kickMember.kick(reason).catch(err => {
			interaction.reply({ content: "An error occurred while trying to kick the user", ephemeral: true });
		});

		await interaction.reply({ embeds: [msgEmbed] });
	},
};
