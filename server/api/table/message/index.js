'use strict';

var express = require('express');
var controller = require('./message.controller.js');

var router = express.Router({ mergeParams: true });

router.get('/', controller.index);
router.get('/:messageId', controller.show);
router.post('/', controller.create);
router.put('/:messageId', controller.update);
router.patch('/:messageId', controller.update);

module.exports = router;
