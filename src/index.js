/**
 * Dependencies
 * 
 */
const { Bot } = require("grammy");
const commands = require("./controllers/commands");
const core = require("./controllers/core");
const data = require("./controllers/data");

/**
 * Environment 
 * 
 * Load the environment variables.
 */
require('dotenv').config();

/**
 * Bot
 * 
 * Create a new Telegraf instance.
 */
const bot = new Bot(process.env.BOT_TOKEN);

/**
 * Redis Client
 * 
 * Create and connect to a new Redis client instance.
 */
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
let redisClient;
(async () => { redisClient = await data.createRedisClient(redisHost, redisPort) })();

/**
 * Commands
 * 
 * Basic commands for the bot, for example, /start.
 */
bot.command("start", commands.start);
bot.command("help", commands.help);
bot.command("auth", commands.auth);

/**
 * Reaction Listener
 * 
 * Listen for message reactions, count and make decisions.
 */
bot.on("message_reaction", async (ctx) => core.onReaction(redisClient, ctx));

/**
 * Launch
 */
bot.start({ allowed_updates: ["message", "message_reaction"] }).then(() => console.log('Bot: up and running!'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
