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

module.exports = schema
