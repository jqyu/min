const Radredis = require('radredis');
const redisOpts = require('../../config/environment').redis;

const transforms = {};

const schema =
      { title: 'User'
      , type: "object"
      , properties:
        { name: { type: 'string' }
        , thumbnail: { type: 'string' }
        }
      };

const User = Radredis(schema, transforms, redisOpts);

module.exports = User;
module.exports.schema = schema;