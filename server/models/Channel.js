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

module.exports = schema
