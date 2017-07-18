'use strict';

const express = require('express');

const logger = require('../lib/logger');
const auth = require('../lib/auth');
const store = require('../lib/store');

const router = express.Router();


router.get('/', function (req, res) {
  const user = res.locals.user;
  return res.json({
    user: user
  });
});

module.exports = router;
