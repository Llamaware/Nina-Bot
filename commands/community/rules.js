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
					option.setName('rule-content')
						.setDescription('The rule to add')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('delete')
				.setDescription('Delete a rule')
				.addIntegerOption(option =>
					option.setName('rule')
						.setDescription('The index of the rule to delete')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('edit')
				.setDescription('edit a rule')
				.addIntegerOption(option =>
					option.setName('rule')
						.setDescription('The index of the rule to edit')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('rule-content')
						.setDescription('The edited rule')
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
		const rule = interaction.options.getString('rule-content');
		const ruleinteger = interaction.options.getInteger('rule');

		// Fetch the content of the pinned message and split it into rules
		const rulesEmbed = pinnedMessage.embeds[0];
		let rules = [];

		if (!rulesEmbed.description) {
			rules = ['No rules'];
		} else {
			rules = rulesEmbed.description.split('\n').map(item => item.substring(item.indexOf('. ') + 2));;
		}

		// Depending on the subcommand, add or delete a rule
		if (subcommand === 'add') {
			//if the list of rules is only "No rules", remove it
			if (rules.length === 1 && rules[0] === 'No rules') {
				rules = [];
			}
			// Add the new rule to the list of rules
			rules.push(rule);
		} else if (subcommand === 'delete') {
			// Remove the rule from the list of rules
			const index = rule - 1;
			rules.splice(index, 1);
			//if the list of rules is empty, add "No rules" to it
			if (rules.length === 0) {
				rules = ['No rules'];
			}
		} else if (subcommand === 'edit') {
			// Edit the rule in the list of rules
			const index = ruleinteger - 1;
			rules.splice(index, 1, rule);
		}

		// pull the embed color from prisma
		const guild = await client.guilds.fetch(interaction.guildId);
		const guildData = await client.db.guild.findUnique({
			where: {
				id: guild.id,
			},
		});
		const color = guildData.embedColor;

		// Create an embed for the rules section
		const newRulesEmbed = new EmbedBuilder()
			.setTitle('Rules')
			.setDescription(rules.map((item, i) => `${i + 1}. ${item}`).join('\n'))
			.setColor(color);

		// Edit the pinned message with the new embed
		await pinnedMessage.edit({
			embeds: [newRulesEmbed]
		});

		// Reply to the interaction ephemeraly
		await interaction.reply({ content: 'Done!', ephemeral: true });
	},
};
