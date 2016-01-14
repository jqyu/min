const Radredis = require('radredis')
const redisOpts = require('../../config/environment').redis

const transforms = {}

const schema =
      { title: 'Item'
      , type: 'object'
      , properties:
        { title:
          { type: 'string'
          }
        , thumbnail:
          { type: 'string'
          }
        , url:
          { type: 'string'
          }
        , type:
          { type: 'string'
          }
        }
      }

const Item = Radredis(schema, transforms, redisOpts)

module.exports = Item
module.exports.schema = schema
