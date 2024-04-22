/**
 * Dependencies
 * 
 */
const info = require("../package.json");
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
  const msg = strings.get(ctx.update.message.from.language_code, 'MSG_WELCOME');
  // Send a welcome message.
  await ctx.reply(msg, { parse_mode: "Markdown" });
  // Send a help message.
  await help(ctx);
  // Send the configs message with bot instance info.
  await configs(ctx);
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
  const msg = strings.get(ctx.update.message.from.language_code, 'MSG_HELP');
  // Send a help message.
  await ctx.reply(msg, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
};

/**
 * Configs
 * 
 * A function that is called when the user sends the /configs command.
 * 
 * @param {import("grammy").CommandContext} ctx the context of the command.
 * @returns {Promise<void>} a promise that resolves when the operation is complete.
 */
const configs = exports.configs = async function(ctx) {
  // Init message with default no-auth message.
  const msg = strings.get(ctx.update.message.from.language_code, 'MSG_CONFIGS', {
    debug: process.env.DEBUG ? strings.get(ctx.update.message.from.language_code, 'ENABLED') : strings.get(ctx.update.message.from.language_code, 'DISABLED'),
    username: process.env.ADMIN_USERNAME ? process.env.ADMIN_USERNAME : strings.get(ctx.update.message.from.language_code, 'UNKNOWN'),
    threshold: process.env.POOP_THRESHOLD,
    version: "v" + info.version,
    is_admin: ctx.update.message.from.username === process.env.ADMIN_USERNAME ? "✔️" : "",
  });
  // Send the message.
  await ctx.reply(msg, { parse_mode: "Markdown" });
};
