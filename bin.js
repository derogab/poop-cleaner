// Get app and info.
const info = require('./package.json');
const { execution, stop } = require('./src');
// Prepare data.
const appName = info.name.toUpperCase();
const appVersion = 'v' + info.version;
// Log.
console.log(appName, appVersion);
// Run app.
execution();
// Enable graceful stop.
process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
