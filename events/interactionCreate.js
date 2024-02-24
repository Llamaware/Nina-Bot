const { Events, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType} = require("discord.js");
module.exports = async (client, guild) => {

	client.on(Events.InteractionCreate, async interaction => {

		if (interaction.isButton()) {

			// if the customId is "Mod Developer", "Tool Developer", or "Totally Normal Role"
			if (interaction.customId == "Mod Developer" || interaction.customId == "Tool Developer" || interaction.customId == "Totally Normal Role") {
				const role = guild.roles.cache.find(role => role.name === interaction.customId);
				if (member.roles.cache.has(role.id)) {
					await member.roles.remove(role);
					await interaction.reply({ content: `Removed the ${role.name} role`, ephemeral: true });
				} else {
					await member.roles.add(role);
					await interaction.reply({ content: `Gave you the ${role.name} role`, ephemeral: true });
				}
			} else if (interaction.customId == "ticket") {
				client.logger.log(interaction.customId, "info");
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
						id: guild.id,
					},
					select: {
						embedColor: true,
					},
				});


				const channel = await interaction.guild.channels.create({
					name: `ticket-${interaction.user.username}`,
					type: ChannelType.GuildText,
					parent: "1199827638991212686",
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
				i.user
					.send({
						content: `Your ticket within ${interaction.guild.name} has been created. You can view it in ${channel}.`,
					})
					.catch((err) => {
						return;
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
	});
};

