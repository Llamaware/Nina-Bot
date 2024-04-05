const {
	SlashCommandBuilder,
	PermissionsBitField,
	ButtonStyle,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
} = require("discord.js");

module.exports = {
	category: "Community",
	// cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("buttonrole")
		.setDescription("Create a role select message")
		.setDefaultMemberPermissions(PermissionsBitField.ManageRoles),
	async execute(interaction, client) {

		const button = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel('Mod Developer')
				.setCustomId('Mod Developer'),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel('Tool Developer')
				.setCustomId('Tool Developer'),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel('Adult Content (18+ only)')
				.setCustomId('Totally Normal Role'),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel('Artist')
				.setCustomId('Artist'),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel('Writer')
				.setCustomId('Writer'),
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

		const embed = new EmbedBuilder()
			.setColor(guildData.embedColor)
			.setTitle('Reaction Roles')
			.setDescription('Press the button to get the role. If you want to remove the role, press the button again.');

		await interaction.channel.send({ embeds: [embed], components: [button] });
		await interaction.reply({ content: "The role select message has been sent.", ephemeral: true });
	},
};