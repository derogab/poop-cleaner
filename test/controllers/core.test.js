const assert = require("node:assert/strict");
const path = require("node:path");

const { loadWithMocks } = require(path.join(__dirname, "..", "..", "test-support", "module-loader.js"));

const corePath = path.join(__dirname, "..", "..", "src", "controllers", "core.js");

test("onReaction saves added poop reactions and deletes over threshold", async () => {
  const calls = [];
  const originalThreshold = process.env.POOP_THRESHOLD;
  process.env.POOP_THRESHOLD = "3";

  const data = {
    async save(redisClient, messageId, userId) {
      calls.push(["save", redisClient, messageId, userId]);
    },
    async remove() {
      calls.push(["remove"]);
    },
    async get(redisClient, messageId) {
      calls.push(["get", redisClient, messageId]);
      return 3;
    },
  };

  const logger = { debug() {} };
  const core = loadWithMocks(corePath, {
    "./data": data,
    "./logger": logger,
    dotenv: { config() {} },
  });

  let deleted = 0;
  const ctx = {
    messageReaction: { user: { id: 5 }, message_id: 12 },
    reactions() {
      return { emojiAdded: ["💩"], emojiRemoved: [] };
    },
    async deleteMessage() {
      deleted += 1;
    },
  };

  try {
    await core.onReaction("redis-client", ctx);
  } finally {
    if (originalThreshold === undefined) delete process.env.POOP_THRESHOLD;
    else process.env.POOP_THRESHOLD = originalThreshold;
  }

  assert.deepEqual(calls, [
    ["save", "redis-client", "12", "5"],
    ["get", "redis-client", "12"],
  ]);
  assert.equal(deleted, 1);
});

test("onReaction removes poop reactions without deleting below threshold", async () => {
  const calls = [];
  const originalThreshold = process.env.POOP_THRESHOLD;
  process.env.POOP_THRESHOLD = "2";

  const data = {
    async save() {
      calls.push(["save"]);
    },
    async remove(redisClient, messageId, userId) {
      calls.push(["remove", redisClient, messageId, userId]);
    },
    async get(redisClient, messageId) {
      calls.push(["get", redisClient, messageId]);
      return 1;
    },
  };

  const core = loadWithMocks(corePath, {
    "./data": data,
    "./logger": { debug() {} },
    dotenv: { config() {} },
  });

  let deleted = 0;
  const ctx = {
    messageReaction: { user: { id: 7 }, message_id: 33 },
    reactions() {
      return { emojiAdded: [], emojiRemoved: ["💩"] };
    },
    async deleteMessage() {
      deleted += 1;
    },
  };

  try {
    await core.onReaction("redis-client", ctx);
  } finally {
    if (originalThreshold === undefined) delete process.env.POOP_THRESHOLD;
    else process.env.POOP_THRESHOLD = originalThreshold;
  }

  assert.deepEqual(calls, [
    ["remove", "redis-client", "33", "7"],
    ["get", "redis-client", "33"],
  ]);
  assert.equal(deleted, 0);
});
