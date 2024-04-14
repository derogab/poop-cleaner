/**
 * Dependencies
 * 
 */
const { Bot } = require("grammy");
const commands = require("./controllers/commands");
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
bot.on("message_reaction", async (ctx) => {
  // Get user id who reacted to the message.
  const userId = '' + ctx.messageReaction.user.id;
  // Get message (only receive the message identifier, not the message content).
  const messageId = '' + ctx.messageReaction.message_id;
  // Get reaction added or removed.
  const { emojiAdded, emojiRemoved } = ctx.reactions();

  // Check if poop-emoji is added to the message.
  if (emojiAdded.includes("💩")) {
    // Save that a user reacted with poop to a message.
    await data.save(redisClient, messageId, userId);
    // Log the event: poop added.
    if (process.env.DEBUG) console.log('Poop emoji added to the message ', messageId, ' by ', userId);
  }

  // Check if poop-emoji is removed from the message.
  if (emojiRemoved.includes("💩")) {
    // Remove that a user reacted with poop to a message.
    await data.remove(redisClient, messageId, userId);
    // Log the event: poop removed.
    if (process.env.DEBUG) console.log('Poop emoji removed from the message ', messageId, ' by ', userId);
  }

  // Get the number of users who reacted with poop to the message.
  const poopCount = await data.get(redisClient, messageId, userId);
  // Delete the message if the number of users who reacted with poop to the message is greater than the threshold.
  if (poopCount >= process.env.POOP_THRESHOLD) await ctx.deleteMessage();

});

/**
 * Launch
 */
bot.start({ allowed_updates: ["message", "message_reaction"] }).then(() => console.log('Bot: up and running!'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
