const _ = require('lodash')
const Radredis = require('radredis')
const redisOpts = require('../../config/environment').redis

// get nodes

const schemas =
      { Channel: require('./Channel')
      , Item: require('./Item')
      , Publication: require('./Publication')
      , User: require('./User')
      }

module.exports = Radredis.factory(schemas);
module.exports.schemas = schemas
