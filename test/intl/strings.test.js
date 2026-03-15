const assert = require("node:assert/strict");
const path = require("node:path");

const stringsPath = path.join(__dirname, "..", "..", "src", "intl", "strings.js");
const strings = require(stringsPath);

test("strings.get returns the localized message", () => {
  assert.equal(strings.get("it", "MSG_WELCOME"), "Benvenuto su *Poop Cleaner Bot*! 🧹");
});

test("strings.get falls back to english for unknown locales", () => {
  assert.equal(strings.get("fr", "UNKNOWN"), "unknown");
});

test("strings.get replaces named placeholders", () => {
  const message = strings.get("en", "MSG_CONFIGS", {
    username: "alice",
    is_admin: "yes",
    threshold: "3",
    version: "v1.2.3",
    debug: "enabled",
  });

  assert.match(message, /@alice/);
  assert.match(message, /`3`/);
  assert.match(message, /`v1.2.3`/);
  assert.match(message, /`enabled`/);
  assert.match(message, /yes/);
});

test("strings.get leaves placeholders untouched when params are missing", () => {
  const message = strings.get("en", "MSG_CONFIGS", {
    username: "alice",
  });

  assert.match(message, /@alice/);
  assert.match(message, /\{threshold\}/);
  assert.match(message, /\{version\}/);
  assert.match(message, /\{debug\}/);
});
