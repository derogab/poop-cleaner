const assert = require("node:assert/strict");
const path = require("node:path");

const commandsPath = path.join(__dirname, "..", "..", "src", "controllers", "commands.js");

test("start sends welcome, help, and configs messages", async () => {
  const commands = require(commandsPath);
  const originalEnv = {
    DEBUG: process.env.DEBUG,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    POOP_THRESHOLD: process.env.POOP_THRESHOLD,
  };

  process.env.DEBUG = "1";
  process.env.ADMIN_USERNAME = "adminuser";
  process.env.POOP_THRESHOLD = "5";

  const replies = [];
  const ctx = {
    update: {
      message: {
        from: {
          language_code: "en",
          username: "adminuser",
        },
      },
    },
    async reply(message, options) {
      replies.push({ message, options });
    },
  };

  try {
    await commands.start(ctx);
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(replies.length, 3);
  assert.match(replies[0].message, /Welcome to the \*Poop Cleaner Bot\*!/);
  assert.equal(replies[0].options.parse_mode, "Markdown");
  assert.match(replies[1].message, /Commands:/);
  assert.deepEqual(replies[1].options, {
    parse_mode: "Markdown",
    link_preview_options: { is_disabled: true },
  });
  assert.match(replies[2].message, /@adminuser/);
  assert.match(replies[2].message, /`5`/);
  assert.match(replies[2].message, /enabled/);
  assert.match(replies[2].message, /✔️/);
});

test("configs uses localized fallbacks for unknown values", async () => {
  const commands = require(commandsPath);
  const originalEnv = {
    DEBUG: process.env.DEBUG,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    POOP_THRESHOLD: process.env.POOP_THRESHOLD,
  };

  delete process.env.DEBUG;
  delete process.env.ADMIN_USERNAME;
  process.env.POOP_THRESHOLD = "2";

  const replies = [];
  const ctx = {
    update: {
      message: {
        from: {
          language_code: "it",
          username: "someone-else",
        },
      },
    },
    async reply(message, options) {
      replies.push({ message, options });
    },
  };

  try {
    await commands.configs(ctx);
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(replies.length, 1);
  assert.match(replies[0].message, /sconosciuto/);
  assert.match(replies[0].message, /disabilitato/);
  assert.doesNotMatch(replies[0].message, /✔️/);
  assert.equal(replies[0].options.parse_mode, "Markdown");
});

test("configs treats DEBUG=0 as disabled", async () => {
  const commands = require(commandsPath);
  const originalEnv = {
    DEBUG: process.env.DEBUG,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    POOP_THRESHOLD: process.env.POOP_THRESHOLD,
  };

  process.env.DEBUG = "0";
  delete process.env.ADMIN_USERNAME;
  process.env.POOP_THRESHOLD = "3";

  const replies = [];
  const ctx = {
    update: {
      message: {
        from: {
          language_code: "en",
          username: "random-user",
        },
      },
    },
    async reply(message, options) {
      replies.push({ message, options });
    },
  };

  try {
    await commands.configs(ctx);
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(replies.length, 1);
  assert.match(replies[0].message, /disabled/);
  assert.doesNotMatch(replies[0].message, /enabled/);
  assert.doesNotMatch(replies[0].message, /✔️/);
});

test("donate uses configured admin address or falls back to N\/A", async () => {
  const commands = require(commandsPath);
  const originalEnv = {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_LIGHTNING_ADDRESS: process.env.ADMIN_LIGHTNING_ADDRESS,
  };

  process.env.ADMIN_USERNAME = "boss";
  delete process.env.ADMIN_LIGHTNING_ADDRESS;

  const replies = [];
  const ctx = {
    update: {
      message: {
        from: {
          language_code: "en",
        },
      },
    },
    async reply(message, options) {
      replies.push({ message, options });
    },
  };

  try {
    await commands.donate(ctx);
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(replies.length, 1);
  assert.match(replies[0].message, /@boss/);
  assert.match(replies[0].message, /`N\/A`/);
  assert.match(replies[0].message, /@derogab/);
  assert.equal(replies[0].options.parse_mode, "Markdown");
});

test("donate falls back to unknown admin and keeps configured address", async () => {
  const commands = require(commandsPath);
  const originalEnv = {
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_LIGHTNING_ADDRESS: process.env.ADMIN_LIGHTNING_ADDRESS,
  };

  delete process.env.ADMIN_USERNAME;
  process.env.ADMIN_LIGHTNING_ADDRESS = "boss@ln.example";

  const replies = [];
  const ctx = {
    update: {
      message: {
        from: {
          language_code: "en",
        },
      },
    },
    async reply(message, options) {
      replies.push({ message, options });
    },
  };

  try {
    await commands.donate(ctx);
  } finally {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  assert.equal(replies.length, 1);
  assert.match(replies[0].message, /@unknown/);
  assert.match(replies[0].message, /`boss@ln\.example`/);
  assert.equal(replies[0].options.parse_mode, "Markdown");
});
