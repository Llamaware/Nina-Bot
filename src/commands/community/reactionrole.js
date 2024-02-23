const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  PermissionsBitField,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactrole")
    .setDescription("Create a reaction role message")
    .setDefaultMemberPermissions(PermissionsBitField.ManageRoles)
    .addRoleOption((option) =>
      option
        .setName(`role1`)
        .setDescription(`The role to give when the first emoji is clicked`)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName(`role2`)
        .setDescription(`The role to give when the second emoji is clicked`)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName(`role3`)
        .setDescription(`The role to give when the third emoji is clicked`)
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const role1 = interaction.options.getRole("role1");
    const role2 = interaction.options.getRole("role2");
    const role3 = interaction.options.getRole("role3");

    if (!interaction.member.permissions.has(PermissionsBitField.ManageRoles)) {
      return await interaction.reply({
        content: "You do not have permission to use this command",
        ephemeral: true,
      });
    }

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("role1")
        .setLabel("Role 1")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("role2")
        .setLabel("Role 2")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("role3")
        .setLabel("Role 3")
        .setStyle(ButtonStyle.Primary)
    );

	const embed = new EmbedBuilder()
	.setColor("Blue")
	.setTitle("Reaction Roles")
	.setDescription(`Click the buttons below to get the roles (${role1}, ${role2}, ${role3})`);
	
	await interaction.reply({ embeds: [embed], components: [button] });
  },
};
