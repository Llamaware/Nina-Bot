const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar of a user')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user of which to get the avatar')
                .setRequired(true)),
    async execute(interaction) {

		//get the embed color from prisma
		const guildData = await interaction.client.prisma.guild.findUnique({
			where: {
				id: interaction.guild.id,
			},
			select: {
				embedColor: true,
			},
		});

        const user = interaction.options.getUser('target');
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s avatar`)
            .setImage(avatarUrl)
			.setColor(guildData.embedColor);

        await interaction.reply({ embeds: [embed] });
    },
};