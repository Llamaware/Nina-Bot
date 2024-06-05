const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
} = require("discord.js");

module.exports = {
	category: "Moderation",
	data: new SlashCommandBuilder()
		.setName("longsigh")
		.setDescription("Ban a user from adult content")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user to ban")
				.setRequired(true)
		),
	async execute(interaction, client) {
		const banUser = interaction.options.getUser("target");
		const banMember = await interaction.guild.members.fetch(banUser.id);

		// Acknowledge the interaction immediately
		await interaction.deferReply();

		if (!banMember)
			return await interaction.followUp({
				content: "User not found",
				ephemeral: true,
			});

			//set the user's adultBan to true in prisma
			await client.prisma.user.update({
				where: {
					id: banUser.id,
				},
				data: {
					adultBan: true,
				},
			});

		const guildData = await client.prisma.guild.findUnique({
			where: {
				id: interaction.guild.id,
			},
			select: {
				embedColor: true,
				moderationChannel: true,
			},
		});

		//if the user has the "Totally Normal Role", remove it
		const role = interaction.guild.roles.cache.find(role => role.name === "Totally Normal Role");
		if (banMember.roles.cache.has(role.id)) {
			await banMember.roles.remove(role);
		}
		
		const moderationChannel = interaction.guild.channels.cache.get(guildData.moderationChannel);
		const banUserDetails = `<@${banUser.id}>`;
		const modDetails = `<@${interaction.user.id}>`;

		const msgEmbed = new EmbedBuilder()
			.setColor(guildData.embedColor)
			.setDescription(`${banUserDetails} has been banned from adult content by ${modDetails}`)

		//send msgEmbed to the moderation channel
		await moderationChannel.send({ embeds: [msgEmbed] });

		//confirm the ban to the user
		await interaction.followUp({
			content: `Banned ${banUser.tag} from adult content`,
			ephemeral: true,
		});

	},
};
