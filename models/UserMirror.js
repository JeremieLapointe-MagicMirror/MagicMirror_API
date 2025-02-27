const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserMirror = sequelize.define(
  "UserMirror",
  {
    idUserMirror: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mirrorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "UserMirror",
    timestamps: false,
  }
);

module.exports = UserMirror;
