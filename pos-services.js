'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const pkg = require('./package');
const logger = require('./server/lib/logger');
const auth = require('./server/lib/auth');
const fixtures = require('./server/fixtures');

// Initialise the application
const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({    // to support URL-encoded bodies
  extended: true
}));



// App configuration
const config = {
  name: pkg.name,
  default_port: 3001,
};
// If we have an environment variable for PORT set,
// like on Heroku, then use that instead of default
config.port = process.env.PORT || config.default_port;

// allow cross-origin requests everywhere
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Load in all the routes
app.use('/', require('./server/routes'));

// Finially, initialise the app
app.listen(config.port, () => {
  logger.info(`Starting pos-services on port ${config.port}`);

  // Load in fixtures
  fixtures.loadAll();
});
