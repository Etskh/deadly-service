'use strict';

const express = require('express');

const logger = require('../lib/logger');
const auth = require('../lib/auth');
const storeController = require('../lib/store');

const router = express.Router();

router.get('/every', function (req, res) {
  return storeController.getAll().then( stores => {
    res.json(stores);
  });
});

router.get('/:storeId', function (req, res) {
  return storeController.getById(req.params.storeId)
  .then(store => {
    // No store? 404!
    if( !store ) {
      return res.json({
        error: 'No store with id ' + req.params.storeId,
      }).status(404);
    }

    res.json(store);
  });
});


module.exports = router;
