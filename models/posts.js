const mongoose = require("mongoose");
const mongoErrorHandler = require('mongoose-mongodb-errors');

const postEntity = mongoose.Schema({
  title: { type: String ,required: true},
  createdAt: { type: Date },
  textContent: { type: String },
  imageUrl: { type: String },
  author: { type: String ,required: true},
  usersLikers: { type: Array },
});
postEntity.plugin(mongoErrorHandler);


module.exports = mongoose.model("Post", postEntity);
