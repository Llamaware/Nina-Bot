const { REST, Routes } = require('discord.js');
require('dotenv').config();
const token = process.env.BOT_TOKEN;
const devGuildId = process.env.devGuildId;
const clientId = process.env.clientId;
const fs = require("fs");

const commands = [];
// Grab all the command folders from the commands directory you created earlier
let folders = fs.readdirSync("./commands/");

folders.forEach((dir) => {
	// Grab all the command files from the commands directory you created earlier
	const commandFiles = fs.readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith(".js"));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const command = require(`./commands/${dir}/${file}`);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
});

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, devGuildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
