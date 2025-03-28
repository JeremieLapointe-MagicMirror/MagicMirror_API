const validator = require("validator");
const bcrypt = require("bcrypt");
const jwtUtil = require("../util/jwtUtil");
const sequelize = require("../config/database");

function sanitizeField(field) {
  return validator.escape(field);
}
