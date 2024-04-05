const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField,
} = require("discord.js");

const {
    resolveSequentially,
} = require('../../utils/resolver.js');

module.exports = {
    category: "Moderation",
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server")
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("The user to kick")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for the kick")
        )
        .setDefaultMemberPermissions(PermissionsBitField.KickMembers),
    async execute(interaction, client) {
        const kickUser = interaction.options.getUser("target");
        const kickMember = await interaction.guild.members.fetch(kickUser.id);
        const channel = interaction.channel;

        await interaction.deferReply();

        if (
            !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
        )
            return await interaction.reply({
                content: "You do not have permission to use this command",
                ephemeral: true,
            });

        if (!kickMember)
            return await interaction.reply({
                content: "User not found",
                ephemeral: true,
            });
//        if (!kickMember.kickable)
//            return await interaction.reply({
//                content: "I cannot kick this user",
//                ephemeral: true,
//            });

        const reason =
            interaction.options.getString("reason") || "No reason provided";

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
            .setDescription(`You have been kicked from **${interaction.guild.name}**\n**Reason:** ${reason}`)

        const kickUserDetails = `<@${kickUser.id}>`;
        const modDetails = `<@${interaction.user.id}>`;
        const msgEmbed = new EmbedBuilder()
            .setColor(guildData.embedColor)
            .setDescription(`${kickUserDetails} has been kicked from the server\n**Reason:** ${reason}`)

        const descriptions = [{
            required: false,
            generator: () => kickMember.send({ embeds: [dmEmbed] }),
            success: null,
            failed: new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setDescription(`Failed to send ${kickUserDetails} the reason for the kick. Did they block the bot?`)
        },{
            required: true,
            generator: () => kickMember.kick(reason),
            success: new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setDescription(`${kickUserDetails} has been kicked from the server by ${modDetails}\n**Reason:** ${reason}`),
            failed: new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setDescription(`${kickUserDetails} could not be kicked by ${modDetails}`),
        }];
        const callback = (embed) => {
            if (embed) {
                moderationChannel.send({ embeds: [embed] });
            }
        };
        const failed = await resolveSequentially(descriptions, callback);

        if (failed) {
            interaction.followUp({ content: "An error occurred while trying to kick the user", ephemeral: true });
        } else {
            interaction.followUp({ embeds: [msgEmbed], ephemeral: true });
        }
    },
};
