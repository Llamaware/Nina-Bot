const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionsBitField,
} = require("discord.js");

module.exports = {
	category: "Community",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("ticket")
		.setDescription("Create a ticket embed and button")
		.setDefaultMemberPermissions(PermissionsBitField.ManageChannels),
	async execute(interaction, client) {
		// Check if the user has the required permissions
		if (
			!interaction.member.permissions.has(
				PermissionsBitField.Flags.ManageChannels
			)
		) {
			// If the user does not have the required permissions, send an error message
			return await interaction.reply({
				content: "You do not have permission to use this command",
				ephemeral: true,
			});
		}

		// Create the button
		const button = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("ticket")
				.setEmoji("✉️")
				.setLabel("Create Ticket")
				.setStyle(ButtonStyle.Secondary)
		);

		// pull the color from prisma
		const guildData = await client.prisma.guild.findUnique({
			where: {
				id: interaction.guild.id,
			},
			select: {
				embedColor: true,
			},
		});

		// Create the embed
		const embed = new EmbedBuilder()
			.setColor(guildData.embedColor)
			.setTitle("Tickets & Support")
			.setDescription("Click the button below to create a ticket");

		// Send the embed and button
		await interaction.channel.send({ embeds: [embed], components: [button] });
		await interaction.reply({ content: "Ticket Embed Created!", ephemeral: true });
	},
};