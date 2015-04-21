/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Table = require('./table.model');

exports.register = function(socket) {
  Table.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Table.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('table:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('table:remove', doc);
}