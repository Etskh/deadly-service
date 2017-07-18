'use strict';

const express = require('express');

const pkg = require('../../package');
const logger = require('../lib/logger');
const auth = require('../lib/auth');

const storeRoute = require('./store');
const userRoute = require('./user');

const router = express.Router();


// Whenever calling the root route, log the request
router.use('/', function(req, res, next) {
  logger.info(`Requesting page ${req.url}`);
  next();
});

// Return the version information with default route
router.get('/', function(req, res) {
  res.json({
    version: pkg.version,
  });
});


router.post('/authenticate', (req, res) => {
  // check for user in payload/params
  auth.authenticate( req.body.username, req.body.password)
  .then( user => {
    return res.json({
      id: user.id,
      username: user.username,
      token: user.token,
    });
  }).catch( err => {
    logger.error(err);
    return res.json({
      error: err,
    });
  });
});


// For each call of the api, check that the user token is valid
router.use('/api', function(req, res, next) {
  auth.checkToken(req.query.token)
  .then( user => {
    res.locals.user = user;
    next();
  }).catch( err => {
    return res.json({
      error: err,
    });
  })
});

// Initialize api modules
router.use('/api/store', storeRoute);
router.use('/api/user', userRoute);


module.exports = router;
