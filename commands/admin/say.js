const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
	category: "Admin",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("say")
		.setDescription("make the bot say something")
		.addStringOption(option =>
			option.setName('message')
				.setDescription("The message to be sent")
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionsBitField.ManageChannels),
	execute: async (interaction, client) => {
		await interaction.channel.send({ content: message, embeds: [embed] });
		await interaction.reply({ content: "Message sent", ephemeral: true });
	}
};
