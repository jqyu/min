const Radredis = require('radredis')
const redisOpts = require('../../config/environment').redis

const transforms = {}

const schema =
      { title: 'Channel'
      , type: 'object'
      , properties:
        { name:
          { type: 'string'
          // TODO: seriously, i should add some descriptions to these fields
          }
        , thumbnail:
          { type: 'string'
          }
        , description:
          { type: 'string'
          }
        }
      , successors:
        { has:
          { to: 'Item'
          , weight: 'integer' // used for position
          }
        }
      }

const Channel = Radredis(schema, transforms, redisOpts)

module.exports = Channel
module.exports.schema = schema
