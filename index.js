const { PrismaClient } = require("@prisma/client");
const { Client, Collection, Events, GatewayIntentBits, Options } = require("discord.js");
const token = process.env.BOT_TOKEN;

const prisma = new PrismaClient();
module.exports = { prisma };

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
		parse: ["roles", "users"],
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
client.resolver = require('./Utils/resolver');
client.prisma = prisma;

(async () => {
	try {
		client.logger.log("Connecting to database...", "info");
		await client.prisma.$connect();
		client.logger.log("Connected to database.", "info");

		["commands", "events"].forEach(handler => {
			require(`./handlers/${handler}`)(client);
		});
		
		client.on('error', error => client.logger.log(error, "error"));
		client.on('warn', info => client.logger.log(info, "warn"));
		process.on('unhandledRejection', error => client.logger.log("UNHANDLED_REJECTION\n" + error, "error"));
		process.on('uncaughtException', error => {
			client.logger.log("UNCAUGHT_EXCEPTION\n" + error, "error");
			client.logger.log("Uncaught Exception is detected, restarting...", "info");
			process.exit(1);
		});
		client.login(token).catch((err) => { client.logger.log(err, "error") });
	} catch (error) {
		client.logger.log(error, "error");
	}
})();
