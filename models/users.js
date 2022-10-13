const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoErrorHandler = require("mongoose-mongodb-errors");

const userEntity = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String },
  mylikes: { type: Array },
  myEvents: { type: Date },
});

userEntity.plugin(uniqueValidator);
userEntity.plugin(mongoErrorHandler);

module.exports = mongoose.model("User", userEntity);
