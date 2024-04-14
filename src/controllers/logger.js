/**
 * Environment 
 * 
 * Load the environment variables.
 */
require('dotenv').config();

/**
 * Info
 * 
 * @param {...any} args the arguments to log.
 * @returns {void} nothing.
 */
exports.info = function(...args) { console.log('INFO\t', ...args); };

/**
 * Debug
 * 
 * @param {...any} args the arguments to log.
 * @returns {void} nothing.
 */
exports.debug = function(...args) { if (process.env.DEBUG) console.error('DEBUG\t', ...args); };

/**
 * Warning
 * 
 * @param {...any} args the arguments to log.
 * @returns {void} nothing.
 */
exports.warning = function(...args) { console.log('WARN\t', ...args); };

/**
 * Error
 * 
 * @param {...any} args the arguments to log.
 * @returns {void} nothing.
 */
exports.error = function(...args) { console.error('ERROR\t', ...args); };
