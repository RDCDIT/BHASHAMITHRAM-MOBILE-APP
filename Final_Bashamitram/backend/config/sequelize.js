/**
 * @file sequelize.js
 * @description Re-exports MySQL Sequelize instance and connection helper.
 */

const { sequelize, connectMySQL, SuggestedWord, DataviewSuggestion, DataviewCollection, Dictionary } = require('./mysql');

module.exports = {
  sequelize,
  connectSQL: connectMySQL,
  SuggestedWord,
  DataviewSuggestion,
  DataviewCollection,
  Dictionary,
};
