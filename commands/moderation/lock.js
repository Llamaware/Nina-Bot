const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("lock")
		.setDescription("locks a channel")
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription("The channel to lock")
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionsBitField.ManageChannels),
	execute: async (interaction, client) => {

		if (!interaction.guild.members.me.permissions.has("MANAGE_CHANNELS")) return interaction.reply({
			content: "I do not have the **MANAGE_CHANNELS** permission in this channel.\nPlease enable it."
		});

		let channel = interaction.options.getChannel('channel');
		channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });

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
			.setDescription(`🔒 ${channel} has been locked`);

		await interaction.reply({ embeds: [embed] });
	}
};
