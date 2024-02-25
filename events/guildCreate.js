module.exports = async (client, guild) => {

	const guildData = await client.prisma.guild.findUnique({
		where: {
			id: guild.id,
		},
		select: {
			prefix: true,
		},
	});
	
	client.settings.ensure(guild.id, { prefix: guildData.prefix });
};