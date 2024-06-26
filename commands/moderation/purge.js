const { SlashCommandBuilder, PermissionsBitField, ChannelType, Embed, ActionRow } = require('discord.js');

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription("Purges channel messages")
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription("The amount of messages to delete")
				.setMinValue(1)
				.setMaxValue(1000)
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionsBitField.ManageMessages),
	execute: async (interaction, client) => {

		if (!interaction.guild.members.me.permissions.has("MANAGE_MESSAGES")) return interaction.reply({
			content: "I do not have the **MANAGE_MESSAGES** permission in this channel.\nPlease enable it."
		});

		let amount = interaction.options.getInteger('amount');

		const deleteCount = Math.floor(amount / 100);
		const remaining = amount % 100;

		for (let i = 0; i < deleteCount; i++) {
			await interaction.channel.bulkDelete(100);
		}

		if (remaining > 0) {
			await interaction.channel.bulkDelete(remaining);
		}

		const message = await interaction.reply({ content: `purged ${amount} messages`, ephemeral: true });
	}
};
