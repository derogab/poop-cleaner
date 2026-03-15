const assert = require("node:assert/strict");
const path = require("node:path");

const { loadWithMocks } = require(path.join(__dirname, "..", "test-support", "module-loader.js"));

const indexPath = path.join(__dirname, "..", "src", "index.js");

test("index registers commands and starts the bot with redis", async () => {
  const originalEnv = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
  };

  process.env.BOT_TOKEN = "token-123";
  process.env.REDIS_HOST = "redis.internal";
  process.env.REDIS_PORT = "6381";

  const botState = {
    token: undefined,
    commands: [],
    listeners: [],
    startOptions: undefined,
    stopSignal: undefined,
  };

  class FakeBot {
    constructor(token) {
      botState.token = token;
    }

    command(name, handler) {
      botState.commands.push([name, handler]);
    }

    on(event, handler) {
      botState.listeners.push([event, handler]);
    }

    start(options) {
      botState.startOptions = options;
      return Promise.resolve();
    }

    stop(signal) {
      botState.stopSignal = signal;
    }
  }

  const commands = {
    start() {},
    help() {},
    configs() {},
    donate() {},
  };
  const data = {
    async createRedisClient(host, port) {
      botState.redisConfig = [host, port];
      return "redis-client";
    },
  };
  const loggerCalls = [];
  const logger = {
    info(...args) {
      loggerCalls.push(["info", ...args]);
    },
    warning(...args) {
      loggerCalls.push(["warning", ...args]);
    },
    error(...args) {
      loggerCalls.push(["error", ...args]);
    },
  };

  const originalExit = process.exit;
  const exitCalls = [];
  process.exit = (code) => {
    exitCalls.push(code);
  };

  try {
    const index = loadWithMocks(indexPath, {
      grammy: { Bot: FakeBot },
      "./controllers/commands": commands,
      "./controllers/core": { onReaction() {} },
      "./controllers/data": data,
      "./controllers/logger": logger,
      dotenv: { config() {} },
    });

    assert.equal(botState.token, "token-123");
    assert.deepEqual(botState.commands.map(([name]) => name), ["start", "help", "configs", "donate"]);
    assert.deepEqual(botState.listeners.map(([event]) => event), ["message_reaction"]);

    await index.execution();
    await index.stop("SIGTERM");
  } finally {
    process.exit = originalExit;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.deepEqual(botState.redisConfig, ["redis.internal", "6381"]);
  assert.deepEqual(botState.startOptions, { allowed_updates: ["message", "message_reaction"] });
  assert.equal(botState.stopSignal, "SIGTERM");
  assert.deepEqual(loggerCalls, [
    ["info", "Bot: up and running!"],
    ["warning", "Bot: stopped with signal SIGTERM."],
  ]);
  assert.deepEqual(exitCalls, [0]);
});

test("index falls back to localhost redis defaults", async () => {
  const originalEnv = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
  };

  process.env.BOT_TOKEN = "token-456";
  delete process.env.REDIS_HOST;
  delete process.env.REDIS_PORT;

  const botState = {
    token: undefined,
    startOptions: undefined,
  };

  class FakeBot {
    constructor(token) {
      botState.token = token;
    }

    command() {}

    on() {}

    start(options) {
      botState.startOptions = options;
      return Promise.resolve();
    }

    stop() {}
  }

  const data = {
    async createRedisClient(host, port) {
      botState.redisConfig = [host, port];
      return "redis-client";
    },
  };

  const index = loadWithMocks(indexPath, {
    grammy: { Bot: FakeBot },
    "./controllers/commands": {
      start() {},
      help() {},
      configs() {},
      donate() {},
    },
    "./controllers/core": { onReaction() {} },
    "./controllers/data": data,
    "./controllers/logger": { info() {}, warning() {}, error() {} },
    dotenv: { config() {} },
  });

  try {
    await index.execution();
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(botState.token, "token-456");
  assert.deepEqual(botState.redisConfig, ["localhost", 6379]);
  assert.deepEqual(botState.startOptions, { allowed_updates: ["message", "message_reaction"] });
});
