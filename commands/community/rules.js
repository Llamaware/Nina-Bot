const {
	SlashCommandBuilder,
	EmbedBuilder,
} = require("discord.js");

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("rules")
		.setDescription('Manage the rules')
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Add a new rule')
				.addStringOption(option =>
					option.setName('rule')
						.setDescription('The rule to add')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('delete')
				.setDescription('Delete a rule')
				.addIntegerOption(option =>
					option.setName('rule')
						.setDescription('The index of the rule to delete')
						.setRequired(true))),
	async execute(interaction, client) {
		// Fetch the pinned message in the channel
		const channel = interaction.channel;
		const pinnedMessages = await channel.messages.fetchPinned();
		let pinnedMessage = pinnedMessages.first();

		// If there is no pinned message, create one
		if (!pinnedMessage) {
			const rulesEmbed = new EmbedBuilder()
				.setTitle('Rules');
			pinnedMessage = await channel.send({
				embeds: [rulesEmbed]
			});
			await pinnedMessage.pin();
		}

		const subcommand = interaction.options.getSubcommand(); // 'add' or 'delete'
		const rule = interaction.options.getString('rule');

		// Fetch the content of the pinned message and split it into rules
		const rulesEmbed = pinnedMessage.embeds[0];
		let rules = [];

		if (!rulesEmbed.description) {
			rules = ['No rules'];
		} else {
			rules = rulesEmbed.description.split('\n');
		}

		// Depending on the subcommand, add or delete a rule
		if (subcommand === 'add') {
			rules.push(rule);
		} else if (subcommand === 'delete') {
			const index = rule - 1;
			rules.splice(index, 1);
			if (rules.length === 0) {
				rules = ['No rules'];
			}
		}

		// Create an embed for the rules section
		const newRulesEmbed = new EmbedBuilder()
			.setTitle('Rules')
			.setDescription(rules.join('\n'));

		// Edit the pinned message with the new embed
		await pinnedMessage.edit({
			embeds: [newRulesEmbed]
		});

		// Reply to the interaction ephemeraly
		await interaction.reply({ content: 'Done!', ephemeral: true });
	},
};
