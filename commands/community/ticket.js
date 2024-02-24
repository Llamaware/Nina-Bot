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
				.setCustomId("button")
				.setEmoji("✉️")
				.setLabel("Create Ticket")
				.setStyle(ButtonStyle.Secondary)
		);

		const embed = new EmbedBuilder()
			.setColor(config.color)
			.setTitle("Tickets & Support")
			.setDescription("Click the button below to create a ticket");

		await interaction.reply({ embeds: [embed], components: [button] });

		const collector = interaction.channel.createMessageComponentCollector();

		collector.on("collect", async (i) => {
			await i.update({ embeds: [embed], components: [button] });

			const channel = await interaction.guild.channels.create({
				name: `ticket-${i.user.username}`,
				type: ChannelType.GuildText,
				parent: "1199827638991212686",
			});

			channel.permissionOverwrites.create(i.user.id, {
				ViewChannel: true,
				SendMessages: true,
			});
			channel.permissionOverwrites.create(channel.guild.roles.everyone, {
				ViewChannel: false,
				SendMessages: false,
			});

			channel.send({
				content: `Welcome to the end of the simulation, ${i.user}. leave now before it's too late`,
			});
			i.user
				.send({
					content: `Your ticket within ${i.guild.name} has been created. You can view it in ${channel}.`,
				})
				.catch((err) => {
					return;
				});
		});
	},
};
