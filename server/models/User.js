const schema =
      { title: 'User'
      , type: 'object'
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
          { to: 'Publication'
          }
        , posted:
          { to: 'Item'
          }
        }
      }

module.exports = schema
