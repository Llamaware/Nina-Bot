const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField,
} = require("discord.js");
const config = require('../../config.json');

module.exports = {
	category: "Moderation",
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName("prismasync")
		.setDescription("DEV -> Sync Guild to Prisma Database")
		.setDefaultMemberPermissions(PermissionsBitField.BanMembers),
	async execute(interaction, client) {

		const m = await interaction.deferReply({
			fetchReply: true,
		});

		interaction.editReply({ content: 'Syncing...' });

		//see if the guild is in the database, if not, add it
		const guildCheck = await client.prisma.guild.findFirst({
			where: {
				id: interaction.guildId,
			},
		});
		if (!guildCheck) {
			await client.prisma.guild.create({
				data: {
					id: interaction.guildId,
					name: interaction.guild.name,
					embedColor: "#c285fe",
					prefix: "n!",
				},
			});
		}

		//loop through users in the guild
		const guild = client.guilds.cache.get(interaction.guildId);
		const guildMembers = guild.members.cache;

		// for each guild member, check if they are in the database. If not, add them.
		guildMembers.forEach(async (member) => {
			const user = await client.prisma.user.findFirst({
				where: {
					id: member.id,
					guildId: interaction.guildId,
				},
			});
			if (!user) {
				await client.prisma.user.create({
					data: {
						id: member.id,
						guildId: interaction.guildId,
					},
				});
			}
		});

		interaction.editReply({ content: 'Synced.' });
	}
};
