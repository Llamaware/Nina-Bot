const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const timezone = require("moment-timezone");

function createModerationEmbed({color, verb, creatorId, targetId, noteId}, customDesc = '') {
    let desc = '';
    if (customDesc.length !== 0) {
        desc = customDesc;
    } else if (targetId.length !== 0) {
        desc = `<@${creatorId}> ${verb} note for <@${targetId}>.\nThe new note id is **${noteId}**`;
    } else {
        desc = `<@${creatorId}> ${verb} note with id **${noteId}**`;
    }
    return new EmbedBuilder()
        .setColor(color)
        .setDescription(desc);
}

module.exports = {
    category: "Moderation",
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("notes")
        .setDescription('Create or edit a note')
        .addSubcommand(subcommand =>
            subcommand.setName('new')
                .setDescription('Create a new note')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to create a note for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for the note')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('history')
                .setDescription('Show notes history for a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to see notes history of')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edit the reason of a note')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the note to modify')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The new note')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Delete a note')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('The ID of the note to delete')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('deleteall')
                .setDescription('Delete all notes for a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to delete the notes of')
                        .setRequired(true))),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('target');
        const id = interaction.options.getInteger('id');
        const reason = interaction.options.getString('reason');

        let creatorId = interaction.user.id;
        let targetId = "";
        let noteId = id;
        let verb = "";
        let desc = '';
        if (subcommand === 'new') {
            verb = "added";
            const note = await client.prisma.note.create({
                data: {
                    userId: target.id,
                    reason: reason,
                    author: interaction.user.tag
                }
            });
            noteId = note.id;
            targetId = target.id;
            await interaction.reply(`Created new note for <@${target.id}>\nNote id is**${noteId}**`);
        }

        if (subcommand === 'history') {
            targetId = target.id;
            desc = `<@${creatorId}> viewed all notes for <@${targetId}>`;
            //pull notes from db
            const notes = await client.prisma.note.findMany({
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
            const notesEmbed = new EmbedBuilder()
                .setColor(guildData.embedColor)
                .setTitle(`Notes for ${target.tag}`)

            if (notes.length === 0) {
                notesEmbed.setDescription("This user has no notes");
            } else {
                notes.forEach((note) => {
                    notesEmbed.addFields(
                        { name: `ID: ${note.id}`, value: `**Moderator:** ${note.author}\n**Reason:** ${note.reason}\n**Date:** ${timezone(note.createdAt).tz("America/Chicago").format("MM/DD/YYYY hh:mm A")}` }
                    );
                });
            }

            await interaction.reply({
                embeds: [notesEmbed]
            });

        }

        if (subcommand === 'edit') {
            verb = "edited";
            const note = await client.prisma.note.update({
                where: {
                    id: id,
                },
                data: {
                    reason: reason,
                    createdAt: new Date()
                },
            });
            
            await interaction.reply({ content: `Edited note with ID ${id}`, ephemeral: true });
        }

        if (subcommand === 'delete') {
            verb = "deleted";
            await client.prisma.note.delete({
                where: {
                    id: id,
                },
            });

            await interaction.reply({ content: `Deleted note with ID ${id}`, ephemeral: true });
        }

        if (subcommand == 'deleteall') {
            targetId = target.id;

            desc = `<@${creatorId}> deleted all notes for <@${targetId}>`;
            await client.prisma.note.deleteMany({
                where: {
                    userId: target.id
                }
            });
            await interaction.reply({ content: 'Deleted all notes', ephemeral: true });
        }

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
            noteId,
        }, desc);

        modChannel?.send({embeds: [embed]});
    },
};
