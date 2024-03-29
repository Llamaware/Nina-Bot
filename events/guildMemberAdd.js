module.exports = async (client, member) => {

	//check if the user is in the database
	const user = await client.prisma.user.findUnique({
		where: {
			id: member.id,
		},
	});

	if (user) {
		client.logger.log(`${member.user.tag} joined the server - they are already in the database`, "info");
		return;
	}

	//add the user to the database
	await client.prisma.user.create({
		data: {
			id: member.id,
			guildId: member.guild.id,
		},
	});
};