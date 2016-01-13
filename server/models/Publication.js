const Radredis = require('radredis');
const redisOpts = require('../../config/environment').redis;

const transforms = {};

const schema =
      { title: 'Publication'
      , type: "object"
      , properties:
        { name: { type: 'string' }
        , thumbnail: { type: 'string' }
        }
      , successors:
        { contains:
          { title: 'contains'
          , to: 'Channel'
          }
        }
      };

const Publication = Radredis(schema, transforms, redisOpts);

module.exports = Publication;
module.exports.schema = schema;
