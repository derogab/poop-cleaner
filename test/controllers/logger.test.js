const assert = require("node:assert/strict");
const path = require("node:path");

const loggerPath = path.join(__dirname, "..", "..", "src", "controllers", "logger.js");
const logger = require(loggerPath);

test("logger.info and logger.warning write to console.log", () => {
  const originalLog = console.log;
  const calls = [];
  console.log = (...args) => calls.push(args);

  try {
    logger.info("hello");
    logger.warning("careful");
  } finally {
    console.log = originalLog;
  }

  assert.deepEqual(calls, [
    ["INFO\t", "hello"],
    ["WARN\t", "careful"],
  ]);
});

test("logger.debug only writes when DEBUG is enabled", () => {
  const originalDebug = process.env.DEBUG;
  const originalError = console.error;
  const calls = [];
  console.error = (...args) => calls.push(args);

  try {
    delete process.env.DEBUG;
    logger.debug("hidden");
    process.env.DEBUG = "1";
    logger.debug("shown");
  } finally {
    console.error = originalError;
    if (originalDebug === undefined) delete process.env.DEBUG;
    else process.env.DEBUG = originalDebug;
  }

  assert.deepEqual(calls, [["DEBUG\t", "shown"]]);
});

test("logger.error writes to console.error", () => {
  const originalError = console.error;
  const calls = [];
  console.error = (...args) => calls.push(args);

  try {
    logger.error("boom");
  } finally {
    console.error = originalError;
  }

  assert.deepEqual(calls, [["ERROR\t", "boom"]]);
});
