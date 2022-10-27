const mongoose = require("mongoose");
const mongoErrorHandler = require('mongoose-mongodb-errors');

const postEntity = mongoose.Schema({
  title: { type: String ,required: true},
  createdAt: { type: Number},
  textContent: { type: String },
  imageUrl: { type: String },
  authorId: { type: String ,required: true},
  authorName: { type: String },
  likers: { type: Array },
});
postEntity.plugin(mongoErrorHandler);
module.exports = mongoose.model("Post", postEntity);

