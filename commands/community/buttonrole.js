const {
	SlashCommandBuilder,
	PermissionsBitField,
	ButtonStyle,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
} = require("discord.js");

const config = require("../../config.json");

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
				.setLabel('Adult Content')
				.setCustomId('Totally Normal Role'),
		);

		const embed = new EmbedBuilder()
			.setColor(config.color)
			.setTitle('Roles')
			.setDescription('Press the button to get the role. If you want to remove the role, press the button again.');

		await interaction.reply({ embeds: [embed], components: [button] });

		//handle button interaction
		const collector = interaction.channel.createMessageComponentCollector();
		collector.on('collect', async (i) => {
			if (i.isButton()) {
				const member = i.member;
				const guild = i.guild;
				const role = guild.roles.cache.find(role => role.name === i.customId);
				if (member.roles.cache.has(role.id)) {
					await member.roles.remove(role);
					await i.reply({ content: `Removed the ${role.name} role`, ephemeral: true });
				} else {
					await member.roles.add(role);
					await i.reply({ content: `Gave you the ${role.name} role`, ephemeral: true });
				}
			}
		});


	},
};
