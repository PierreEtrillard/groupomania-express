const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoErrorHandler = require("mongoose-mongodb-errors");

const userEntity = mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  connectAT:{type:Date},
  photo: { type: String },
  myHobbies: { type: String },
  myLikes: { type: Array },
  myEvents: { type: Array },
});

userEntity.plugin(uniqueValidator);
userEntity.plugin(mongoErrorHandler);

module.exports = mongoose.model("User", userEntity);
