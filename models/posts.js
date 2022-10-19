const mongoose = require("mongoose");
const mongoErrorHandler = require('mongoose-mongodb-errors');

const postEntity = mongoose.Schema({
  title: { type: String ,required: true},
  createdAt: { type: Date },
  textContent: { type: String },
  imageUrl: { type: String },
  authorId: { type: String ,required: true},
  authorName: { type: String ,required: true},
  likers: { type: Array },
  comment:{type:Array}
});
postEntity.plugin(mongoErrorHandler);
module.exports = mongoose.model("Post", postEntity);

