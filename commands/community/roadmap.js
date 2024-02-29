const {
	ActionRowBuilder,
	SlashCommandBuilder,
	ChannelType,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	AttachmentBuilder,
} = require("discord.js");

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("roadmap")
		.setDescription('Manage the roadmap')
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Create a new item on the roadmap')
				.addStringOption(option =>
					option.setName('item')
						.setDescription('The item to add')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('section')
						.setDescription('The section to add the item to')
						.setRequired(true)
						.addChoices(
							{ name: 'In Progress', value: 'In Progress' },
							{ name: 'Planned', value: 'Planned' }
						)))
		.addSubcommand(subcommand =>
			subcommand.setName('delete')
				.setDescription('delete an item from the roadmap')
				.addIntegerOption(option =>
					option.setName('item')
						.setDescription('The index of the item to delete')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('section')
						.setDescription('The section to delete the item from')
						.setRequired(true)
						.addChoices(
							{ name: 'In Progress', value: 'In Progress' },
							{ name: 'Planned', value: 'Planned' }
						)))
		.addSubcommand(subcommand =>
			subcommand.setName('move')
				.setDescription('move an item from one section to another')
				.addIntegerOption(option =>
					option.setName('item')
						.setDescription('The current index of the item to move')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('from_section')
						.setDescription('The section to move the item from')
						.setRequired(true)
						.addChoices(
							{ name: 'In Progress', value: 'In Progress' },
							{ name: 'Planned', value: 'Planned' }
						))
				.addStringOption(option =>
					option.setName('to_section')
						.setDescription('The section to move the item to')
						.setRequired(true)
						.addChoices(
							{ name: 'In Progress', value: 'In Progress' },
							{ name: 'Planned', value: 'Planned' }
						))),
	async execute(interaction, client) {
		// Fetch the pinned messages in the channel
		const channel = interaction.channel;
		const pinnedMessages = await channel.messages.fetchPinned();
		let pinnedMessage = pinnedMessages.first();

		// If there is no pinned message, create one
		if (!pinnedMessage) {
			const inProgressEmbed = new EmbedBuilder()
				.setTitle('In Progress')
			const plannedEmbed = new EmbedBuilder()
				.setTitle('Planned')
			pinnedMessage = await channel.send({
				embeds: [inProgressEmbed, plannedEmbed]
			});
			await pinnedMessage.pin();
		}

		const subcommand = interaction.options.getSubcommand(); // 'add', 'delete', or 'move'
		const item = subcommand === 'add' ? interaction.options.getString('item') : interaction.options.getInteger('item');
		const section = interaction.options.getString('section'); // 'In Progress' or 'Planned'

		// Fetch the content of the pinned message and split it into sections
		const progressSection = pinnedMessage.embeds.find(embed => embed.title === 'In Progress');
		const plannedSection = pinnedMessage.embeds.find(embed => embed.title === 'Planned');
		let inProgressItems = [];
		let plannedItems = [];

		if (!progressSection.description) {
			inProgressItems = ['No items in progress'];
		} else {
			inProgressItems = progressSection.description.split('\n').map(item => item.substring(item.indexOf('. ') + 2));
		}

		if (!plannedSection.description) {
			plannedItems = ['No items planned'];
		} else {
			plannedItems = plannedSection.description.split('\n').map(item => item.substring(item.indexOf('. ') + 2));
		}

		//pull the color from prisma
		const guildData = await client.prisma.guild.findUnique({
			where: {
				id: interaction.guild.id,
			},
			select: {
				embedColor: true,
			},
		});
		
		// Depending on the subcommand, add, delete, or move an item
		if (subcommand === 'add') {
			if (section === 'In Progress') {
				if (inProgressItems[0] === 'No items in progress') {
					inProgressItems[0] = item;
				} else {
					inProgressItems.push(item);
				}
			} else if (section === 'Planned') {
				if (plannedItems[0] === 'No items planned') {
					plannedItems[0] = item;
				} else {
					plannedItems.push(item);
				}
			}
		} else if (subcommand === 'delete') {
			const index = item - 1;
			if (section === 'In Progress') {
				inProgressItems.splice(index, 1);
				if (inProgressItems.length === 0) {
					inProgressItems[0] = 'No items in progress';
				}
			} else if (section === 'Planned') {
				plannedItems.splice(index, 1);
				if (plannedItems.length === 0) {
					plannedItems[0] = 'No planned items';
				}
			}
		} else if (subcommand === 'move') {
			const index = item - 1;
			const fromSection = interaction.options.getString('from_section');
			const toSection = interaction.options.getString('to_section');
			let movedItem;
			if (fromSection === 'In Progress') {
				movedItem = inProgressItems.splice(index, 1)[0];
				if (inProgressItems.length === 0) {
					inProgressItems[0] = 'No items in progress';
				}
			} else if (fromSection === 'Planned') {
				movedItem = plannedItems.splice(index, 1)[0];
				if (plannedItems.length === 0) {
					plannedItems[0] = 'No planned items';
				}
			}
			if (toSection === 'In Progress') {
				if (inProgressItems[0] === 'No items in progress') {
					inProgressItems[0] = movedItem;
				} else {
					inProgressItems.push(movedItem);
				}
			} else if (toSection === 'Planned') {
				if (plannedItems[0] === 'No planned items') {
					plannedItems[0] = movedItem;
				} else {
					plannedItems.push(movedItem);
				}
			}
		}

		// Create embeds for each section
		const newInProgressEmbed = new EmbedBuilder()
			.setTitle('In Progress')
			.setDescription(inProgressItems.map((item, i) => `${i + 1}. ${item}`).join('\n'))
			.setColor(guildData.embedColor);

		const newPlannedEmbed = new EmbedBuilder()
			.setTitle('Planned')
			.setDescription(plannedItems.map((item, i) => `${i + 1}. ${item}`).join('\n'))
			.setColor(guildData.embedColor);

		// Edit the pinned message with the new embeds
		await pinnedMessage.edit({
			embeds: [newInProgressEmbed, newPlannedEmbed]
		});

		// Reply to the interaction ephemeraly
		await interaction.reply({ content: 'Done!', ephemeral: true });
	},
};