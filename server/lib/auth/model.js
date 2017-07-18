'use strict';

const fetchdb = require('fetchdb');
const logger = require('../logger');
const utils = require('./util');
//const dbConfig = require('./index').dbConfig;
const dbConfig = {
  type: 'sqlite3',
  filename: 'db.sqlite3',
}


const permissionModelSchema = {
  db: dbConfig,
  schema: {
    code: 'string',
    description: 'string',
  },
  methods: {
    // empty
  },
};
const groupPermissionSchema = {
  db: dbConfig,
  schema: {
    permissionId: 'number',
    groupId: 'number',
  },
  methods: {
    // empty
  },
};
const groupModelSchema = {
  db: dbConfig,
  schema: {
    name: 'string',
    precedence: 'number',
  },
  methods: {
    getPermissions: ( self ) => {
      return fetchdb('permission').search({ groupId: self.id });
    },
    addPermission: ( self, permissionId ) => {
      logger.info(`Adding permissionId ${permissionId} to group ${self.name}`);
      return fetchdb('groupPermission').create({
        groupId: self.id,
        permissionId: permissionId,
      });
    },
  },
};
const userModelSchema = {
  db: dbConfig,
  schema: {
    username: 'string',
    passwordHash: 'string',
    tokenHash: 'string',
    group: fetchdb.foreignKey('group'),
    store: fetchdb.foreignKey('store'),
  },
  methods: {
    hasPermission: (self, code) => {
      return self.getPermissions().then( permissions => {
        if(_.find(permissions, {code: code})) {
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      });
    },
    getPermissions: ( self ) => {
      return fetchdb('group').search({ id: self.group }).then( groups => {
        if ( groups.length === 0 ) {
          return Promise.reject(`No known group with id ${self.group}`);
        }
        const group = groups[0];
        return group.getPermissions().then( permissions => {
          return Promise.resolve(permissions);
        });
      });
    },
  },
};

module.exports.permission = fetchdb('permission', permissionModelSchema);
module.exports.groupPermission = fetchdb('groupPermission', groupPermissionSchema );
module.exports.group = fetchdb('group', groupModelSchema);
module.exports.user = fetchdb('user', userModelSchema );
