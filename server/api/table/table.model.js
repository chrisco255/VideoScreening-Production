'use strict';

var mongoose = require('mongoose'),
  MessageSchema = require('./message/message.schema'),
  Schema = mongoose.Schema,
  _ = require('lodash'),
  ObjectId = Schema.ObjectId;

var TableHostSchema = new Schema({
  name: { type: String, required: true },
  ref_id: { type: ObjectId, required: true }
});

var TableParticipantSchema = new Schema({
  name: { type: String, required: true },
  ref_id: { type: ObjectId, required: true }
});

var TableSchema = new Schema({
  hosts: {
    type: [TableHostSchema],
    required: true
  },
  title: { type: String, required: true },
  topic: String,
  messages: {
    type: [MessageSchema],
    required: true
  },
  highlightURL: String,
  participants: {
    type: [TableParticipantSchema],
    required: true
  }
});

//Validations
TableSchema.path('hosts').validate(function(hosts) {
  return _.isArray(hosts) &&
      hosts.length > 0;
}, 'Table must have at least one host');

TableSchema.path('participants').validate(function(hosts) {
  return _.isArray(hosts) &&
    hosts.length > 0;
}, 'Table must have at least one participant');

TableSchema.path('messages').validate(function(hosts) {
  return _.isArray(hosts) &&
    hosts.length > 0;
}, 'Table must have at least one message');

module.exports = mongoose.model('Table', TableSchema);
