const { Sequelize } = require('sequelize');
require('dotenv').config();

// Assuming standard local XAMPP/phpMyAdmin setup since it was exported from phpMyAdmin
const sequelize = new Sequelize('shabdadb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL (Sequelize) Connected: shabdadb');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
  }
};

module.exports = { sequelize, connectSQL };
