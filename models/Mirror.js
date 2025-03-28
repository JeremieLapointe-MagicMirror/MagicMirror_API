const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Mirror = sequelize.define(
  "Mirror",
  {
    idMirror: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    config: {
      type: DataTypes.STRING(100000),
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastUpdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Mirror",
    timestamps: false,
  }
);

module.exports = Mirror;
