'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MessageSchema = new Schema({
  topic: { type: String, required: true },
  tags: [String],
  videoURL: String,
  author: [{
    photo: String,
    name: String,
    id: String
  }],
  cheers: [String]
});

module.exports = MessageSchema;
