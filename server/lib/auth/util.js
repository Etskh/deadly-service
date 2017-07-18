'use strict';

const _ = require('lodash');
const logger = require('../logger');
const models = require('./model');


/*
{
  level0: {
    level1_a: {
      level2_a: [
        level3_a,
        level3_b,
      ],
    },
    level1_b: [
      level2_b,
    ]
  }
}
-->
[
  level0.level1_a.level2_a.level3_a,
  level0.level1_a.level2_a.level3_b,
  level0.level1_b.level2_b,
]
*/
// Returns an array of permissions
const parsePermissions_r = function(permObject, parent) {
  // for storing child values
  var fields = [];

  // If leaf node in heirarchy
  if( typeof permObject === 'string' ) {
    return [ parent + permObject ];
  }
  // Finally if it's an object
  else {
    if( permObject.length ) {
      permObject.forEach( field => {
        fields = fields.concat(parsePermissions_r(field, parent + '.' ));
      });
    }
    else {
      for ( var field in permObject ) {
        fields = fields.concat(parsePermissions_r(permObject[field], parent + '.' + field ));
      }
    }
  }

  // And now give the fields back up
  return fields;
}

const loadPermissions = function( permissions ) {
  var permsToCheck = [];
  permissions.forEach( perm => {
    permsToCheck.push(models.permission.search({ code: perm }));
  });

  return Promise.all(permsToCheck).then( existingPerms => {
    const permsToAdd = [];
    permissions.forEach( perm => {
      // If we don't have it, add it to the list
      if( ! _.find(existingPerms, { code: perm }) ) {
        permsToAdd.push(
          models.permission.create({
            code: perm,
            description: '-no description-',
          })
        ); // .push()
      }
    });

    return Promise.all(permsToAdd);
  });
}


const saveGroupPermissions = function( groupName, addedPermList, groupPermList) {
  // TODO: change this to using .get
  return models.group.search({name: groupName}).then( groups => {

    const group = groups[0];
    const groupAddPermOps = [];

    if( !group ) {
      return Promise.reject(`Can't find group with name: ${groupName}`);
    }

    groupPermList.forEach( permCode => {
      // If this permission has been added, then update the group's perms
      const perm = _.find(addedPermList, {code: permCode});
      if( perm ) {
        groupAddPermOps.push(group.addPermission(perm.id));
      }
    });
    return Promise.all(groupAddPermOps);
  });
};



module.exports.parseAndLoadPermissions = function( permissionObject, groupPerms) {
  const permissionArray = parsePermissions_r(permissionObject, 'pos');

  // save all permissions to group
  return loadPermissions(permissionArray).then( perms => {

    // Save the permissions to all groups
    const groupOps = [];
    for( let groupName in groupPerms ) {
      groupOps.push(saveGroupPermissions(groupName, perms, groupPerms[groupName]));
    }

    return Promise.all(groupOps);
  }).catch( err => {
    logger.error(err);
  });
}
