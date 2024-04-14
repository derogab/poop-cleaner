/**
 * Dependencies
 * 
 */
const redis = require("redis");
const logger = require("./logger");

/**
 * Create a new Redis client instance.
 * 
 * @param {string} host the host of the Redis server.
 * @param {number} port the port of the Redis server.
 * @returns {Promise<import("@redis/client").RedisClientType>} a new Redis client instance.
 */
exports.createRedisClient = async function(host, port) {
  // Define the Redis client.
  // See: https://github.com/redis/node-redis/blob/master/docs/client-configuration.md
  const redisClient = redis.createClient({ url: `redis://${host}:${port}` });

  // Define the Redis events.
  // See: https://github.com/redis/node-redis#events
  redisClient.on('connect', () => logger.info('Redis: connect'));
  redisClient.on('ready', () => logger.info('Redis: ready'));
  redisClient.on('end', () => logger.info('Redis: end'));
  redisClient.on('error', (err) => logger.error('Redis Error:', err));
  redisClient.on('reconnecting', () => logger.debug('Redis: reconnecting'));

  // Connect to the Redis server.
  await redisClient.connect();

  // Return the Redis client instance.
  return redisClient;
};

/**
 * Save that a user reacted with poop to a message.
 * 
 * @param {import("@redis/client").RedisClientType} redisClient the Redis client instance.
 * @param {string} messageId the message id.
 * @param {string} userId the user id.
 */
exports.save = async function(redisClient, messageId, userId) {
  // Define the key for current message.
  const key = 'POOP:' + messageId;
  // Save user id to the set of users who reacted with poop to the message.
  const [sAddReply, sCardReply, expireReply] = await redisClient
    .multi()
    .sAdd(key, userId) // Add user id to the set.
    .sCard(key) // Get the number of users who reacted with poop to the message.
    .expire(key, 30 * 24 * 60 * 60) // Update expiration, time: 30 days.
    .exec();
  // Return the number of users who reacted with poop to the message.
  return sCardReply;
};

/**
 * Remove that a user reacted with poop to a message.
 * 
 * @param {import("@redis/client").RedisClientType} redisClient the Redis client instance.
 * @param {string} messageId the message id.
 * @param {string} userId the user id.
 */
exports.remove = async function(redisClient, messageId, userId) {
  // Define the key for current message.
  const key = 'POOP:' + messageId;
  // Save user id to the set of users who reacted with poop to the message.
  const [sRemReply, sCardReply, expireReply] = await redisClient
    .multi()
    .sRem(key, userId) // Add user id to the set.
    .sCard(key) // Get the number of users who reacted with poop to the message.
    .expire(key, 30 * 24 * 60 * 60) // Update expiration, time: 30 days.
    .exec();
  // Return the number of users who reacted with poop to the message.
  return sCardReply;
};

/**
 * Get the number of users who reacted with poop to a message.
 * 
 * @param {import("@redis/client").RedisClientType} redisClient the Redis client instance.
 * @param {string} messageId the message id.
 */
exports.get = async function(redisClient, messageId) {
  // Define the key for current message.
  const key = 'POOP:' + messageId;
  // Get the number of users who reacted with poop to the message.
  return await redisClient.sCard(key) || 0;
};
