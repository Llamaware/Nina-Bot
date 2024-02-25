const { Events, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType } = require("discord.js");
module.exports = async (client, interaction) => {
	if (interaction.isButton()) {

		// if the customId is "Mod Developer", "Tool Developer", or "Totally Normal Role"
		if (interaction.customId == "Mod Developer" || interaction.customId == "Tool Developer" || interaction.customId == "Totally Normal Role") {
			const role = interaction.guild.roles.cache.find(role => role.name === interaction.customId);
			if (roles.cache.has(role.id)) {
				await member.roles.remove(role);
				await interaction.reply({ content: `Removed the ${role.name} role`, ephemeral: true });
			} else {
				await member.roles.add(role);
				await interaction.reply({ content: `Gave you the ${role.name} role`, ephemeral: true });
			}
		} else if (interaction.customId == "ticket") {
			const button = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("ticket")
					.setEmoji("✉️")
					.setLabel("Create Ticket")
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true)
			);

			//pull color from prisma
			const color = await client.prisma.guild.findUnique({
				where: {
					id: interaction.guild.id,
				},
				select: {
					embedColor: true,
				},
			});

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

			channel.send({
				content: `Welcome to the end of the simulation, ${interaction.user}. leave now before it's too late`,
			});

			interaction.reply({
				content: `Your ticket within ${interaction.guild.name} has been created. You can view it in ${channel}.`,
				ephemeral: true
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

