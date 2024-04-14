/**
 * Dependencies
 * 
 */
const data = require("./data");

/**
 * Environment 
 * 
 * Load the environment variables.
 */
require('dotenv').config();

/**
 * On Reaction
 * 
 * A function that is called when a reaction is added or removed from a message.
 * 
 * @param {import("@redis/client").RedisClientType} redisClient the Redis client instance.
 * @param {import("grammy").Context} ctx the context of the command.
 * @returns {Promise<void>} a promise that resolves when the operation is complete.
 */
exports.onReaction = async function(redisClient, ctx) {
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
};
