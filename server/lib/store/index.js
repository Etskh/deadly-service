'use strict';

// Store model
const model = require('./model').store;

// Use the main db
module.exports.dbConfig = require('../../config');
module.exports.permissions = require('./permissions');


const convertToHal = function( store ) {
  return {
    id: store.id,
    name: store.name,
    tagline: store.tagline,
  };
}

module.exports.getAll = function() {
  return model.search({}).then( stores => {
    const storeList = [];
    stores.forEach( store => {
      storeList.push(convertToHal(store));
    });
    return storeList;
  });
}

module.exports.getById = function( id ) {
  return model.search({ id: id }).then( stores => {
    if( stores.length === 0 ) {
      return Promise.resolve(null);
    }
    return convertToHal(stores[0]);
  });
}
