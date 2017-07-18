'use strict';

const fetchdb = require('fetchdb');
const dbConfig = {
  type: 'sqlite3',
  filename: 'db.sqlite3',
};

const storeSchema = {
  db: dbConfig,
  schema: {
    name: 'string',
    tagline: 'string'
  },
};

const storeUserSchema = {
  db: dbConfig,
  schema: {
    user: fetchdb.foreignKey('user'),
    store: fetchdb.foreignKey('store'),
  },
  methods: {
    // empty
  }
};


const storeModel = fetchdb('store', storeSchema);

module.exports.store = storeModel;
