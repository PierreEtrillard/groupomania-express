const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoErrorHandler = require("mongoose-mongodb-errors");

const userEntity = mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  connectAt:{type:Number},
  lastConnectAt:{type:Number},
  photo: { type: String },
  myLikes: { type: Array },
});

userEntity.plugin(uniqueValidator);
userEntity.plugin(mongoErrorHandler);

module.exports = mongoose.model("User", userEntity);
