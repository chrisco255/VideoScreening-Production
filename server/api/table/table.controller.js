'use strict';

var _ = require('lodash');
var Table = require('./table.model');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

// Get list of tables
exports.index = function(req, res) {
  Table.find(function (err, tables) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(tables);
  });
};

// Get a single table
exports.show = function(req, res) {
  Table.findById(ObjectId(req.params.tableId), function (err, table) {
    if(err) { return handleError(res, err); }
    if(!table) { return res.status(404).end(); }
    return res.json(table);
  });
};

// Creates a new table in the DB.
exports.create = function(req, res) {
  Table.create(req.body, function(err, table) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(table);
  });
};

// Updates an existing table in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Table.findById(req.params.tableId, function (err, table) {
    if (err) { return handleError(res, err); }
    if(!table) { return res.status(404).end(); }
    var updated = _.merge(table, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(table);
    });
  });
};

// Deletes a table from the DB. (Not an active route at this time)
exports.destroy = function(req, res) {
  Table.findById(req.params.id, function (err, table) {
    if(err) { return handleError(res, err); }
    if(!table) { return res.status(404).end(); }
    table.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
