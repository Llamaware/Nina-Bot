const { 
    SlashCommandBuilder,
} = require('@discordjs/builders');

const {
    EmbedBuilder,
} = require('discord.js');

const {
    resolveSequentially,
} = require('../../utils/resolver.js');

const timezone = require('moment-timezone');

function createModerationEmbed({color, verb, creatorId, targetId, warnId}, customDesc = '') {
    let desc = '';
    if (customDesc.length !== 0) {
        desc = customDesc;
    } else if (targetId.length !== 0) {
        desc = `<@${creatorId}> ${verb} warn for <@${targetId}>.\nThe new warn id is **${warnId}**`;
    } else {
        desc = `<@${creatorId}> ${verb} warn with id **${warnId}**`;
    }
    return new EmbedBuilder()
        .setColor(color)
        .setDescription(desc);
}

module.exports = {
    category: 'Moderation',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Create or edit a warning')
        .addSubcommand(subcommand =>
            subcommand.setName('new')
                .setDescription('Issue a warning')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to warn for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for the warning')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('history')
                .setDescription('Show warning history for a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to see warning history of')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edit the reason of a warning')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the warning to modify')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The new reason')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Delete a warning')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the warning to delete')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('deleteall')
                .setDescription('Delete all warnings for a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to delete the warnings of')
                        .setRequired(true))),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('target');
        const id = interaction.options.getInteger('id');
        const reason = interaction.options.getString('reason');

        let creatorId = interaction.user.id;
        let targetId = '';
        let warnId = id;
        let verb = '';
        let desc = '';
        if (subcommand === 'new') {
            await interaction.deferReply();

            verb = 'added';
            const warn = await client.prisma.warning.create({
                data: {
                    userId: target.id,
                    reason: reason,
                    author: interaction.user.tag
                }
            });
            warnId = warn.id;
            targetId = target.id;

            const guildData = await client.prisma.guild.findUnique({
                where: {
                    id: interaction.guild.id,
                },
                select: {
                    embedColor: true,
                },
            });

            const dmEmbed = new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setDescription(`You have been warned in **${interaction.guild.name}**\n**Reason:** ${reason}`);

            const descriptions = [{
                required: true,
                generator: async function() {
                    const dm = await target.createDM();
                    // send a dm to the target
                    await dm.send({ embeds: [dmEmbed] });
                },
                success: false,
                failed: true,
            }];
            const callback = (embed) => {
                if (embed) {
                    desc = `Failed to send warning to <@${targetId}>. Did they block the bot?`;
                }
            };
            const failed = await resolveSequentially(descriptions, callback);

            if (failed) {
                interaction.followUp({ content: "An error occurred while trying to warn the user", ephemeral: true });
            } else {

                const msg = `<@${target.id}> has been warned\nWarning id is **${warnId}**` ;
                interaction.followUp({ content: msg, ephemeral: true });
            }
        }

        if (subcommand === 'edit') {
            verb = 'edited';
            await client.prisma.warning.update({
                where: {
                    id: id
                },
                data: {
                    reason: reason,
                    createdAt: new Date()
                }
            });

            await interaction.reply({ content: `Edited warning #${id}`, ephemeral: true });
        }

        if (subcommand === 'delete') {
            verb = 'deleted';
            await client.prisma.warning.delete({
                where: {
                    id: id
                }
            });

            await interaction.reply({ content: `Deleted warning #${id}`, ephemeral: true });
        }

        if (subcommand === 'history') {
            targetId = target.id;
            desc = `<@${creatorId}> viewed all warnings for <@${targetId}>`;
            //pull warnings from db
            const warnings = await client.prisma.warning.findMany({
                where: {
                    userId: target.id
                }
            });

            const guildData = await client.prisma.guild.findUnique({
                where: {
                    id: interaction.guild.id,
                },
                select: {
                    embedColor: true,
                },
            });
        
            //create embed
            const warningsEmbed = new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setTitle(`Warnings for ${target.tag}`)

            if (warnings.length === 0) {
                warningsEmbed.setDescription('This user has no warnings');
            } else {
                warnings.forEach((warning) => {
                    warningsEmbed.addFields(
                        { name: `ID: ${warning.id}`, value: `**Moderator:** ${warning.author}\n**Reason:** ${warning.reason}\n**Date:** ${timezone(warning.createdAt).tz('America/Chicago').format('MM/DD/YYYY hh:mm A')}` }
                    );
                });
            }

            await interaction.reply({
                embeds: [warningsEmbed]
            });
        }

        if (subcommand == 'deleteall') {
            targetId = target.id;

            desc = `<@${creatorId}> deleted all warnings for <@${targetId}>`;
            await client.prisma.warning.deleteMany({
                where: {
                    userId: target.id
                }
            });
            await interaction.reply({ content: 'Deleted all warnings', ephemeral: true});
        }


        try {
            const guildData = await client.prisma.guild.findUnique({
                where: {
                    id: interaction.guild.id,
                },
                select: {
                    embedColor: true,
                    moderationChannel: true,
                },
            });
            const modChannel = interaction.guild.channels.cache.get(guildData.moderationChannel);

            const embed = createModerationEmbed({
                color: guildData.embedColor,
                verb,
                creatorId,
                targetId,
                warnId,
            }, desc);
            await modChannel.send({embeds: [embed]})
        } catch(e) {
            console.log(e)
        }
    },
};
