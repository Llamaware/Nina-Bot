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
				.setDescription('close a modmail'))
		.addSubcommand(subcommand =>
			subcommand.setName('forceclose')
				.setDescription('force close a modmail')),
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

			// Fetch all members in the channel
			const members = channel.members.filter(member => !member.user.bot && !member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Moderator'));

			// Ping all eligible members
			const pingedUsers = members.map(member => member.toString()).join(' ');

			// Create a confirmation button
			const button = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('confirm_close')
					.setLabel('Confirm')
					.setStyle(ButtonStyle.Secondary)
			);

			// pull the embed color from the database
			const guildData = await client.prisma.guild.findUnique({
				where: {
					id: interaction.guild.id,
				},
				select: {
					embedColor: true,
				},
			});

			// reply to the interaction ephemeraly, confirming the message was sent
			

			// Send the user an embed message with the confirmation button
			const embed = new EmbedBuilder()
				.setTitle('Confirm Modmail Closure')
				.setDescription(`Please confirm if you are done with this modmail. If there is no response <t:${Math.floor(Date.now() / 1000) + 86400}:R>, the modmail will be automatically closed.\n\n${pingedUsers}`)
				.setColor(guildData.embedColor);

			const msg = await interaction.reply({ embeds: [embed], components: [button] });

			await interaction.followUp({ content: `Sent confirmation message`, ephemeral: true });
			// Create a message collector to wait for the user's response
			const collector = msg.createMessageComponentCollector({ time: 86400000 });
			collector.on('collect', async (interaction) => {
				await generateTranscript(interaction, channel, client);
				await interaction.deferUpdate();
				await channel.delete();
			});

			collector.on('end', async (collected, reason) => {
				if (reason === 'time') {
					await generateTranscript(interaction, channel, client);
					await channel.delete();
				}
			});
		} else if (subcommand === 'forceclose') {
			const channel = interaction.channel;

			if (!channel.name.startsWith('ticket-')) {
				return await interaction.reply({ content: `This is not a modmail`, ephemeral: true });
			}

			await generateTranscript(interaction, channel, client);

			await channel.delete();
			await interaction.reply({ content: `Force closed the modmail`, ephemeral: true });
		}
	},
};

// new async function called generateTranscript
async function generateTranscript(interaction, channel, client) {
	client.logger.log(channel);
	let messages = [];
	let lastId;
	while (true) {
		const batch = await channel.messages.fetch({ limit: 100, before: lastId });
		if (!batch.size) break;
		messages = [...messages, ...batch.values()];
		lastId = batch.last().id;
	}

	// Format the messages into a string
	let transcript = '';
	messages.reverse().forEach(message => {
		const timestamp = message.createdAt.toISOString();
		const author = message.author.tag;
		const content = message.cleanContent;
		transcript += `${timestamp} - ${author}: ${content}\n`;
	});

	// Write the string to a .txt file
	const fs = require('fs');
	const filename = `${channel.id}_transcript.txt`;
	fs.writeFileSync(filename, transcript);


	const guildData = await client.prisma.guild.findUnique({
		where: {
			id: interaction.guild.id,
		},
		select: {
			transcriptChannel: true,
		},
	});

	// Send the transcript as an attachment to the transcript channel, which has an id of guildData.transcriptChannel
	const attachment = new AttachmentBuilder(filename);
	const transcriptChannel = interaction.guild.channels.cache
		.get(guildData.transcriptChannel);
	await transcriptChannel.send({ files: [attachment] });

	//delete the file that fs.writeFileSync created
	fs.unlink(filename, (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});
}
