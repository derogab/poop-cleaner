/**
 * Dependencies
 * 
 */
const strings = require("../intl/strings");

/**
 * Environment 
 * 
 * Load the environment variables.
 */
require('dotenv').config();

/**
 * Start
 * 
 * A function that is called when the user sends the /start command.
 * 
 * @param {import("grammy").CommandContext} ctx the context of the command.
 * @returns {Promise<void>} a promise that resolves when the operation is complete.
 */
exports.start = async function(ctx) {
  // Init data.
  const msg = strings.get(ctx.update.message.from.language_code, 'WELCOME_MSG');
  // Send a welcome message.
  await ctx.reply(msg, { parse_mode: "Markdown" });
  // Send a help message.
  await help(ctx);
  // Send an auth message, with instructions for the admin or info about the bot for other users.
  await auth(ctx);
};

/**
 * Help
 * 
 * A function that is called when the user sends the /help command.
 * 
 * @param {import("grammy").CommandContext} ctx the context of the command.
 * @returns {Promise<void>} a promise that resolves when the operation is complete.
 */
const help = exports.help = async function(ctx) {
  // Init data.
  const msg = strings.get(ctx.update.message.from.language_code, 'HELP_MSG');
  // Send a help message.
  await ctx.reply(msg, { parse_mode: "Markdown" });
};

/**
 * Auth
 * 
 * A function that is called when the user sends the /auth command.
 * 
 * @param {import("grammy").CommandContext} ctx the context of the command.
 * @returns {Promise<void>} a promise that resolves when the operation is complete.
 */
const auth = exports.auth = async function(ctx) {
  // Init message with default no-auth message.
  let msg = strings.get(ctx.update.message.from.language_code, 'AUTH_MSG_NO_ADMIN');
  // Check if the user is the admin.
  if (ctx.update.message.from.username === process.env.ADMIN_USERNAME) {
    // If admin, replace the message with the auth message.
    msg = strings.get(ctx.update.message.from.language_code, 'AUTH_MSG_ADMIN', {
      debug: process.env.DEBUG ? 'YES' : 'NO',
      username: process.env.ADMIN_USERNAME,
      threshold: process.env.POOP_THRESHOLD,
    });
  }
  // Send the message.
  await ctx.reply(msg, { parse_mode: "Markdown" });
};
