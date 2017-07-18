'use strict';

const bcrypt = require('bcrypt');
const md5 = require('md5');

const models = require('./model');

module.exports.utils = require('./util');

// Use the main db
module.exports.dbConfig = require('../../config');
module.exports.permissions = require('./permissions');



const toJson = function (userController) {
  return {
    username: userController.username,
    token: userController.tokenHash,
  };
};



module.exports.checkToken = function( token ) {
  if( !token ) {
    return Promise.reject('Token does not exist');
  }

  // TODO: check that it is also valid after a certain type

  return models.user.search({ tokenHash: token }).then( users => {
    if( users.length === 0 ) {
      return Promise.reject('Token rejected');
    }
    return toJson(users[0]);
  });
};



module.exports.authenticate = function( username, password ) {
  var user = null;
  return models.user.search({ username: username }).then( users => {
    if( users.length === 0 ) {
      return Promise.reject(`User with username ${username} doesnt exist`);
    }
    user = users[0];
    return user;
  }).then( user => {
    return bcrypt.compare(password, user.passwordHash)
  }).then( res => {
    if( !res) {
      return Promise.reject(`Password not accepted`);
    }

    // create a new token to invalidate previous ones
    user.tokenHash = md5(bcrypt.genSaltSync(10));
    user.save();

    return Promise.resolve(toJson(user));
  });
};


module.exports.getAllGroups = function() {
  return models.group.search({});
};

module.exports.getAllUsers = function() {
  return models.user.search({});
};
