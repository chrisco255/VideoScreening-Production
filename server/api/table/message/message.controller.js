'use strict';

var _ = require('lodash');
var Table = require('../table.model');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

// Get list of messages
exports.index = function(req, res) {
  Table.findById(ObjectId(req.params.tableId), function (err, table) {
    if(err) { return handleError(res, err); }
    if(!table) { return res.status(404).end(); }
    return res.status(200).json(table.messages);
  });
};

// Get a single message
exports.show = function(req, res) {
  var messageId = req.params.messageId;
  Table.findById(ObjectId(req.params.tableId), function (err, table) {
    if(err) { return handleError(res, err); }
    if(!table) { return res.status(404).end(); }
    var message = _.find(table.messages, { "_id" : ObjectId(messageId) });
    if(!message) { return res.status(404).end(); }
    return res.status(200).json(message);
  });
};

// Creates a new message in the DB.
exports.create = function(req, res) {
  var message = req.body;
  if(!message) { return res.status(500).end(); }

  Table.findById(ObjectId(req.params.tableId), function (err, table) {
    if(err) { return handleError(res, err); }
    if(!table) { return res.status(404).end(); }
    table.messages.push(message);
    table.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(201).json(message);
    });
  });
};

// Updates an existing message in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  var message = req.body;
  var messageId = req.params.messageId;
  if(!message) { return res.status(500).end(); }

  Table.findById(ObjectId(req.params.tableId), function (err, table) {
    if(err) { return handleError(res, err); }
    if(!table) { return res.status(404).end(); }
    var oldMessage = _.find(table.messages, { "_id" : ObjectId(messageId) });
    if(!oldMessage) { return res.status(404).end(); }
    var merged = _.merge(oldMessage, message);
    table.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(merged);
    });
  });
};

function handleError(res, err) {
  return res.status(500).json(err);
}
