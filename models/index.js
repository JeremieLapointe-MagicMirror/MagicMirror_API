const User = require("./User");
const Mirror = require("./Mirror");
const UserMirror = require("./UserMirror");

// Définir les associations
User.belongsToMany(Mirror, {
  through: UserMirror,
  foreignKey: "userId",
  otherKey: "mirrorId",
});

Mirror.belongsToMany(User, {
  through: UserMirror,
  foreignKey: "mirrorId",
  otherKey: "userId",
});

module.exports = {
  User,
  Mirror,
  UserMirror,
};
