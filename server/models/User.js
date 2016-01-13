const Radredis = require('radredis');
const redisOpts = require('../../config/environment').redis;

const transforms = {};

const schema =
      { title: 'User'
      , type: "object"
      , properties:
        { name:
          { type: 'string'
          , description: 'descriptions are a good thing to have !!'
          }
        , thumbnail:
          { type: 'string'
          }
        }
      , successors:
        { canedit:
          { title: 'canedit'
          , to: 'Publication'
          }
        }
      };

const User = Radredis(schema, transforms, redisOpts);

module.exports = User;
module.exports.schema = schema;
