//setup command that sets gathers values for the guild and stores them in the database

const { SlashCommandBuilder, ChannelType, Guild } = require('discord.js');

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("setup")
		.setDescription('Setup the bot for your server')
		.addStringOption(option =>
			option.setName('embedcolor')
				.setDescription('The hex color of the embeds')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('prefix')
				.setDescription('The prefix for the bot')
				.setRequired(false))
		.addChannelOption(option =>
			option.setName('ticketcategory')
				.setDescription('The category for tickets')
				.addChannelTypes(ChannelType.GuildCategory)
				.setRequired(false))
		.addChannelOption(option =>
			option.setName('welcomechannel')
				.setDescription('The channel for welcome messages')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(false))
		.addChannelOption(option =>
			option.setName('transcriptchannel')
				.setDescription('The channel for ticket transcripts')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(false)),

	async execute(interaction, client) {

		// get the values from the options
		const embedColor = interaction.options.getString('embedcolor');
		const prefix = interaction.options.getString('prefix');
		const ticketCategory = interaction.options.getChannel('ticketcategory');
		const welcomeChannel = interaction.options.getChannel('welcomechannel');
		const transcriptChannel = interaction.options.getChannel('transcriptchannel');

		// check if they are valid
		if (embedColor && !embedColor.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
			return await interaction.reply({ content: 'Invalid color', ephemeral: true });
		}

		if (prefix && prefix.length > 5) {
			return await interaction.reply({ content: 'Prefix too long', ephemeral: true });
		}

		// get the guild id and name
		const guildId = interaction.guildId;
		const guildName = interaction.guild.name;

		//filter out null values
		const data = {};
		if (embedColor) data.embedColor = embedColor;
		if (prefix) data.prefix = prefix;
		if (ticketCategory) data.ticketCat = ticketCategory.id;
		if (welcomeChannel) data.welcChannel = welcomeChannel.id;
		if (transcriptChannel) data.transcriptChannel = transcriptChannel.id;

		//check if the guild is already in the database
		const guild = await client.prisma.guild.findUnique({
			where: {
				id: guildId,
			},
		});

		if (guild) {
			await client.prisma.guild.update({
				where: { id: guildId },
				data,
			});
		} else {
			await client.prisma.guild.create({
				data: {
					id: guildId,
					name: guildName,
					...data,
				},
			});
		}

		//prompt the user to run the prismasync command

		await interaction.reply({ content: `Setup complete. Run the prismasync command to sync your users`, ephemeral: true });
	},
}