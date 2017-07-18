'use strict';

const bunyan = require('bunyan');
const pkg = require('../../package');

// Initialise logging
module.exports = bunyan.createLogger({
  name: pkg.name,
  src: true,
});
