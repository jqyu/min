const schema =
      { title: 'Publication'
      , type: 'object'
      , properties:
        { name: { type: 'string' }
        , thumbnail: { type: 'string' }
        }
      , successors:
        { has:
          { to: 'Channel'
          }
        }
      };

module.exports = schema
