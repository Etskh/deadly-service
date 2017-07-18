'use strict';

const _ = require('lodash');
const fetchdb = require('fetchdb');
const logger = require('./lib/logger');


const getOrLoadFixtures = function( model, fixtureData, uniqueField ) {
  const fixturesToLoad = [];

  fixtureData.forEach( fixture => {
    const search = {};
    search[uniqueField] = fixture[uniqueField];

    model.search(search).then( models => {
      // If it already exists, leave
      if( models.length > 0 ) {
        logger.info(`Created model ${fixture[uniqueField]} from fixtures`);
        fixturesToLoad.push(Promise.resolve(models[0]));
        return;
      }
      // Create our fixture data
      fixturesToLoad.push(model.create(fixture));
    });
  });

  return Promise.all(fixturesToLoad);
};


const loadFixtures = function() {
  const groupFixtures = [{
    name: 'administrator',
    precedence: 1,
  }, {
    name: 'manager',
    precedence: 2,
  }];
  const storeFixtures = [{
    name: 'Deadly',
    tagline: 'Where the dead is',
  }];

  // Models that are loaded independently
  const groupModel = fetchdb('group');
  const storeModel = fetchdb('store');

  return Promise.all([
    // load the group fixtures
    getOrLoadFixtures(groupModel, groupFixtures, 'name'),
    // load the store fixtures
    getOrLoadFixtures(storeModel, storeFixtures, 'name'),
  ]).then( results => {

    const userModel = fetchdb('user');

    const groups = results[0];
    const stores = results[1];

    const userFixtures = [{
      username: 'admin',
      passwordHash: '$2a$10$ajjBK9hqMul9.m5Aa/.45.yRAWYiNTUtX88qTrQD1AswV6ZYpdgbW',
      tokenHash: 'fuckyouimtheadmin',
      group: _.find(groups, {name: 'administrator'}),
      store: null,
    }, {
      username: 'manager',
      passwordHash: '$2a$10$ajjBK9hqMul9.m5Aa/.45.yRAWYiNTUtX88qTrQD1AswV6ZYpdgbW',
      tokenHash: 'none',
      group: _.find(groups, {name: 'manager'}),
      store: _.find(stores, {name: 'Deadly'}),
    }];

    return getOrLoadFixtures( userModel, userFixtures, 'username' );
  }).catch( err => {
    console.error(err);
  });
};


module.exports.loadAll = loadFixtures;
