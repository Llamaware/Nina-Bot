const { Events, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType } = require("discord.js");
module.exports = async (client, interaction) => {
	if (interaction.isButton()) {
		// if the customId is "Mod Developer", "Tool Developer", or "Totally Normal Role"
		if (interaction.customId == "Mod Developer" || interaction.customId == "Tool Developer" || interaction.customId == "Totally Normal Role" || interaction.customId === "Artist" || interaction.customId === "Writer") {
			const role = interaction.guild.roles.cache.find(role => role.name === interaction.customId);
			if (interaction.member.roles.cache.has(role.id)) {
				client.logger.log(`Removing the ${role.name} role from ${interaction.user.tag}`, "info");
				await interaction.member.roles.remove(role);
				await interaction.reply({ content: `Removed the ${role.name} role`, ephemeral: true });
			} else {
				client.logger.log(`Giving the ${role.name} role to ${interaction.user.tag}`, "info");
				await interaction.member.roles.add(role);
				await interaction.reply({ content: `Gave you the ${role.name} role`, ephemeral: true });
			}
		} else if (interaction.customId == "ticket") {
			// see if the user has a ticket already
			const ticketChannel = interaction.guild.channels.cache.find(channel => channel.name === `ticket-${interaction.user.username}`);
			if (ticketChannel) {
				return interaction.reply({
					content: `You already have a ticket open in ${ticketChannel}.`,
					ephemeral: true
				});
			}

			// pull ticket category from prisma
			const guildData = await client.prisma.guild.findUnique({
				where: {
					id: interaction.guild.id,
				},
				select: {
					ticketCat: true,
				},
			});

			const channel = await interaction.guild.channels.create({
				name: `ticket-${interaction.user.username}`,
				type: ChannelType.GuildText,
				parent: guildData.ticketCat,
			});

			channel.permissionOverwrites.create(interaction.user.id, {
				ViewChannel: true,
				SendMessages: true,
			});
			channel.permissionOverwrites.create(channel.guild.roles.everyone, {
				ViewChannel: false,
				SendMessages: false,
			});
			//give the bot permission to ping @everyone in the channel
			channel.permissionOverwrites.create(interaction.guild.members.me, {
				ViewChannel: true,
				SendMessages: true,
				MentionEveryone: true,
			});

			let chosenQuote;

			const random = Math.random();
			if (random <= 0.1) {
				// 10% chance
				chosenQuote = "hjo iou shu' b' aereshi' 'sh da 'iver";
			} else if (random <= 0.30) {
				// 20% chance
				chosenQuote = "Seagull eat fish. But fish belong to Mafia. Mafia punch seagull for not respecting Mafia. Seagull say 'No, please! I have child!' Mafia punch seagull with child.";
			} else if (random <= 0.40) {
				// 10% chance
				chosenQuote = "Sister 'complex'... really? I find it quite simple. - Virus.Dos.OneHalf, 2023";
			} else if (random <= 0.50) {
				// 10% chance
				chosenQuote = "Brother 'complex'... really? I find it quite simple. - Virus.Dos.OneHalf, 2023";
			} else if (random <= 0.75) {
				// 25% chance 
				chosenQuote = "whatever OneHalf's quote is, it's probably better than this one.";
			} else if (random <= 1) {
				// 25% chance
				chosenQuote = "Higher beings, these words are for you alone.";
			}

			channel.send({
				content: chosenQuote
			});

			interaction.reply({
				content: `Your ticket within ${interaction.guild.name} has been created. You can view it in ${channel}.`,
				ephemeral: true
			});

			//follow up message pinging @everyone in the channel
			channel.send({
				content: `@everyone, a ticket has been created.`,
			});

		}
	}

	if (interaction.isChatInputCommand()) {

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction, client);
		} catch (error) {
			client.logger.log(error, "error");
		} finally {
			client.logger.log(`> ID : ${interaction.user.id} | User : ${interaction.user.tag} | command | ${command.data.name}`, "info");
		}
	}
};

