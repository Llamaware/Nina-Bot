const { Client, Collection, Events, GatewayIntentBits, Options} = require("discord.js");
const config = require("./config.json");

const client = new Client({
	closeTimeout: 3_000,
	waitGuildTimeout: 15_000,
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.MessageContent
	],
	allowedMentions: {
		parse: ["users"],
		repliedUser: true
	},
	makeCache: Options.cacheWithLimits({
		...Options.DefaultMakeCacheSettings,
		ReactionManager: 0,
		GuildMemberManager: {
			maxSize: 200,
			keepOverLimit: member => member.id === client.user.id,
		}
	}),
});

client.settings = {
	name: "settings",
	fetchAll: false,
	autoFetch: true,
	cloneLevel: "deep"
};

client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();
client.logger = require('./Utils/logger');

["commands", "events"].forEach(handler => {
	require(`./handlers/${handler}`)(client);
});

// handle slash commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, client);
	} catch (error) {
		client.logger.log(error, "error");
	}
});

client.on('error', error => client.logger.log(error, "error"));
client.on('warn', info => client.logger.log(info, "warn"));
process.on('unhandledRejection', error => client.logger.log("UNHANDLED_REJECTION\n" + error, "error"));
process.on('uncaughtException', error => {
	client.logger.log("UNCAUGHT_EXCEPTION\n" + error, "error");
	client.logger.log("Uncaught Exception is detected, restarting...", "info");
	process.exit(1);
});
client.login(config.token).catch((err) => { client.logger.log(err, "error") });
