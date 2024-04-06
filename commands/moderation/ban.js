const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField,
} = require("discord.js");

module.exports = {
    category: "Moderation",
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the server")
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("The user to ban")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for the ban")
        )
        .setDefaultMemberPermissions(PermissionsBitField.BanMembers),
    async execute(interaction, client) {
        const banUser = interaction.options.getUser("target");
        const banMember = await interaction.guild.members.fetch(banUser.id);
        const channel = interaction.channel;

        // Acknowledge the interaction immediately
        await interaction.deferReply();

        if (
            !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
        )
            return await interaction.followUp({
                content: "You do not have permission to use this command",
                ephemeral: true,
            });

        if (!banMember)
            return await interaction.followUp({
                content: "User not found",
                ephemeral: true,
            });
//      if (!banMember.bannable)
//          return await interaction.followUp({
//              content: "I cannot ban this user",
//              ephemeral: true,
//          });

        const reason =
            interaction.options.getString("reason") || "No reason provided";
        
        // Add the ban to prisma
        await client.prisma.ban.create({
            data: {
                userId: banUser.id,
                reason: reason,
                author: interaction.user.tag,
                revoked: false,
            },
        });

        const guildData = await client.prisma.guild.findUnique({
            where: {
                id: interaction.guild.id,
            },
            select: {
                embedColor: true,
                moderationChannel: true,
            },
        });
        const moderationChannel = interaction.guild.channels.cache.get(guildData.moderationChannel);

        const dmEmbed = new EmbedBuilder()
            .setColor(guildData.embedColor)
            .setDescription(
                `You have been banned from **${interaction.guild.name}**\n**Reason:** ${reason}`
            );
        const banUserDetails = `<@${banUser.id}>`;
        const modDetails = `<@${interaction.user.id}>`;


        const descriptions = [{
            required: false,
            generator: () => banMember.send({ embeds: [dmEmbed] }),
            success: null,
            failed: new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setDescription(`Failed to send ${banUserDetails} the reason for the ban. Did they block the bot?`)
        },{
            required: true,
            generator: () => banMember.ban({reason}),
            success: new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setDescription(`${banUserDetails} has been banned from the server by ${modDetails}\n**Reason:** ${reason}`),
            failed: new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setDescription(`${banUserDetails} could not be banned by ${modDetails}`),
        }];
        const callback = (embed) => {
            if (embed) {
                moderationChannel.send({ embeds: [embed] });
            }
        };
        const failed = await client.resolver.resolveSequentially(descriptions, callback);

        if (failed) {
            interaction.followUp({ content: "An error occurred while trying to ban the user", ephemeral: true });
        } else {
            interaction.followUp({ embeds: [descriptions.success], ephemeral: true });
        }
    },
};
