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
			pinnedMessage = await channel.send('In Progress:\n\nPlanned:\n');
			await pinnedMessage.pin();
		}

		const subcommand = interaction.options.getSubcommand(); // 'add', 'delete', or 'move'
		const item = subcommand === 'add' ? interaction.options.getString('item') : interaction.options.getInteger('item');
		const section = interaction.options.getString('section'); // 'In Progress' or 'Planned'

		// Fetch the content of the pinned message and split it into sections
		const sections = pinnedMessage.content.split('\n\n');
		const inProgressIndex = sections.findIndex(section => section.startsWith('In Progress:'));
		const plannedIndex = sections.findIndex(section => section.startsWith('Planned:'));

		// Split each section into items and remove the number at the beginning
		const inProgressItems = sections[inProgressIndex].split('\n').slice(1).map(item => item.replace(/^\d+\. /, ''));
		const plannedItems = sections[plannedIndex].split('\n').slice(1).map(item => item.replace(/^\d+\. /, ''));

		// Depending on the subcommand, add, delete, or move an item
		if (subcommand === 'add') {
			if (section === 'In Progress') {
				inProgressItems.push(item);
			} else if (section === 'Planned') {
				plannedItems.push(item);
			}
		} else if (subcommand === 'delete') {
			const index = item - 1;
			if (section === 'In Progress') {
				inProgressItems.splice(index, 1);
			} else if (section === 'Planned') {
				plannedItems.splice(index, 1);
			}
		} else if (subcommand === 'move') {
			const index = item - 1;
			const fromSection = interaction.options.getString('from_section');
			const toSection = interaction.options.getString('to_section');
			let movedItem;
			if (fromSection === 'In Progress') {
				movedItem = inProgressItems.splice(index, 1)[0];
			} else if (fromSection === 'Planned') {
				movedItem = plannedItems.splice(index, 1)[0];
			}
			if (toSection === 'In Progress') {
				inProgressItems.push(movedItem);
			} else if (toSection === 'Planned') {
				plannedItems.push(movedItem);
			}
		}

		// Join the items back together with numbers and update the sections
		sections[inProgressIndex] = 'In Progress:\n' + inProgressItems.map((item, i) => `${i + 1}. ${item}`).join('\n');
		sections[plannedIndex] = 'Planned:\n' + plannedItems.map((item, i) => `${i + 1}. ${item}`).join('\n');

		// Join the sections back together and edit the pinned message
		const newContent = sections.join('\n\n');
		await pinnedMessage.edit(newContent);

		// Reply to the interaction ephemeraly
		await interaction.reply({ content: 'Done!', ephemeral: true });
	}
};