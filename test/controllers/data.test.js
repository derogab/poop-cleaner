const assert = require("node:assert/strict");
const path = require("node:path");

const { loadWithMocks } = require(path.join(__dirname, "..", "..", "test-support", "module-loader.js"));

const dataPath = path.join(__dirname, "..", "..", "src", "controllers", "data.js");

test("createRedisClient creates, wires, and connects the client", async () => {
  const events = [];
  let connectCalls = 0;
  const client = {
    on(event, handler) {
      events.push({ event, handler });
      return this;
    },
    async connect() {
      connectCalls += 1;
    },
  };

  const logger = {
    info() {},
    debug() {},
    error() {},
  };

  let receivedConfig;
  const data = loadWithMocks(dataPath, {
    redis: {
      createClient(config) {
        receivedConfig = config;
        return client;
      },
    },
    "./logger": logger,
  });

  const result = await data.createRedisClient("redis-host", 6380);

  assert.equal(result, client);
  assert.deepEqual(receivedConfig, { url: "redis://redis-host:6380" });
  assert.equal(connectCalls, 1);
  assert.deepEqual(events.map(({ event }) => event), ["connect", "ready", "end", "error", "reconnecting"]);
});

test("save stores the user reaction and returns the set size", async () => {
  const steps = [];
  const redisClient = {
    multi() {
      return {
        sAdd(key, userId) {
          steps.push(["sAdd", key, userId]);
          return this;
        },
        sCard(key) {
          steps.push(["sCard", key]);
          return this;
        },
        expire(key, ttl) {
          steps.push(["expire", key, ttl]);
          return this;
        },
        async exec() {
          steps.push(["exec"]);
          return [1, 4, 1];
        },
      };
    },
  };

  const data = loadWithMocks(dataPath, {
    redis: { createClient() { throw new Error("not used"); } },
    "./logger": { info() {}, debug() {}, error() {} },
  });

  const result = await data.save(redisClient, "42", "7");

  assert.equal(result, 4);
  assert.deepEqual(steps, [
    ["sAdd", "POOP:42", "7"],
    ["sCard", "POOP:42"],
    ["expire", "POOP:42", 2592000],
    ["exec"],
  ]);
});

test("remove deletes the user reaction and returns the set size", async () => {
  const steps = [];
  const redisClient = {
    multi() {
      return {
        sRem(key, userId) {
          steps.push(["sRem", key, userId]);
          return this;
        },
        sCard(key) {
          steps.push(["sCard", key]);
          return this;
        },
        expire(key, ttl) {
          steps.push(["expire", key, ttl]);
          return this;
        },
        async exec() {
          steps.push(["exec"]);
          return [1, 2, 1];
        },
      };
    },
  };

  const data = loadWithMocks(dataPath, {
    redis: { createClient() { throw new Error("not used"); } },
    "./logger": { info() {}, debug() {}, error() {} },
  });

  const result = await data.remove(redisClient, "42", "7");

  assert.equal(result, 2);
  assert.deepEqual(steps, [
    ["sRem", "POOP:42", "7"],
    ["sCard", "POOP:42"],
    ["expire", "POOP:42", 2592000],
    ["exec"],
  ]);
});

test("get returns the current reaction count or zero", async () => {
  const calls = [];
  const redisClient = {
    async sCard(key) {
      calls.push(key);
      return 0;
    },
  };

  const data = loadWithMocks(dataPath, {
    redis: { createClient() { throw new Error("not used"); } },
    "./logger": { info() {}, debug() {}, error() {} },
  });

  const result = await data.get(redisClient, "42");

  assert.equal(result, 0);
  assert.deepEqual(calls, ["POOP:42"]);
});
