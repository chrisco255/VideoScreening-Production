'use strict';

var express = require('express');
var controller = require('./table.controller');
var messageRouter = require('./message');

var router = express.Router();

router.get('/', controller.index);
router.get('/:tableId', controller.show);
router.post('/', controller.create);
router.put('/:tableId', controller.update);
router.patch('/:tableId', controller.update);

router.use('/:tableId/messages', messageRouter);

module.exports = router;
