const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("MagicMirror", "lapoi", "Patate123", {
  host: "localhost",
  dialect: "mariadb",
  dialectOptions: {
    timezone: "Etc/GMT+2",
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
