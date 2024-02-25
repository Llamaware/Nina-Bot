const {
	SlashCommandBuilder,
	ChannelType
} = require("discord.js");

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("modmail")
		.setDescription('Manage Modmails')
		.addSubcommand(subcommand =>
			subcommand.setName('new')
				.setDescription('Create a new modmail')
				.addUserOption(option =>
					option.setName('target')
						.setDescription('The user to create a modmail for')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('add a user to an existing modmail')
				.addUserOption(option =>
					option.setName('target')
						.setDescription('The user to add')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('close')
				.setDescription('close a modmail')),
	async execute(interaction, client) {
		const target = interaction.options.getUser('target');
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'new') {

			// pull the parent category from the database
			const guildData = await client.prisma.guild.findUnique({
				where: {
					id: interaction.guild.id,
				},
				select: {
					ticketCat: true,
				},
			});

			const channel = await interaction.guild.channels.create({
				name: `ticket-${target.username}`,
				type: ChannelType.GuildText,
				parent: guildData.ticketCat,
			});

			channel.permissionOverwrites.create(interaction.guild.roles.everyone, {
				ViewChannel: false,
				SendMessages: false,
			});
			channel.permissionOverwrites.create(target.id, {
				ViewChannel: true,
				SendMessages: true,
			});

			await interaction.reply({ content: `Created modmail for ${target.tag}`, ephemeral: true });
		} else if (subcommand === 'add') {

			const channel = interaction.channel;

			if (!channel.name.startsWith('ticket-')) {
				return await interaction.reply({ content: `This is not a modmail`, ephemeral: true });
			}

			channel.permissionOverwrites.create(target.id, {
				ViewChannel: true,
				SendMessages: true,
			});

			await interaction.reply({ content: `Added ${target.tag} to the modmail`, ephemeral: true });
		} else if (subcommand === 'close') {

			const channel = interaction.channel;

			if (!channel.name.startsWith('ticket-')) {
				return await interaction.reply({ content: `This is not a modmail`, ephemeral: true });
			}

			await channel.delete();

			await interaction.reply({ content: `Closed the modmail`, ephemeral: true });

		}
	},
};