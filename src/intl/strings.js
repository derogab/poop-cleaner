/**
 * Dependencies
 * 
 */
const intl_en = require("./intl_en.json");
const intl_it = require("./intl_it.json");

/**
 * Environment 
 * 
 * Load the environment variables.
 */
require('dotenv').config();

/**
 * Get JSON
 * 
 * A function that returns the correct JSON object for the given locale.
 * 
 * @param {string} locale the locale to get the JSON object for.
 * @returns {object} the JSON object for the given locale.
 */
const getJson = function(locale) {
  // Return the correct JSON object for the given locale.
  switch (locale.toLowerCase()) {
    case 'en':
      return intl_en;
    case 'it':
      return intl_it;
    default:
      return intl_en;
  }
}

/**
 * Get
 * 
 * A function that returns the correct string for the given key and locale.
 * 
 * @param {string} locale the locale to get the JSON object for.
 * @param {string} key the key representing the string to get.
 * @returns {string} the string for the given key and locale.
 */
exports.get = function(locale, key) {
  // Return the correct string for the given key and locale.
  return getJson(locale)[key];
};