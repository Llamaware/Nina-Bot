const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	ButtonInteraction,
	PermissionsBitField,
} = require("discord.js");
const config = require('../../config.json');
module.exports = {
	category: "Community",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("ticket")
		.setDescription("Create a ticket embed and button")
		.setDefaultMemberPermissions(PermissionsBitField.ManageChannels),
	async execute(interaction, client) {
		if (
			!interaction.member.permissions.has(
				PermissionsBitField.Flags.ManageChannels
			)
		) {
			return await interaction.reply({
				content: "You do not have permission to use this command",
				ephemeral: true,
			});
		}

		const button = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("ticket")
				.setEmoji("✉️")
				.setLabel("Create Ticket")
				.setStyle(ButtonStyle.Secondary)
		);

		const embed = new EmbedBuilder()
			.setColor(config.color)
			.setTitle("Tickets & Support")
			.setDescription("Click the button below to create a ticket");

		await interaction.reply({ embeds: [embed], components: [button] });
	},
};
