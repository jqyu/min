const _ = require('lodash');

// get nodes
// Note: key must match the "title" field of the respective schemas
// otherwise the object associations fuck up

const Models =
      { Channel: require('./Channel')
      , Publication: require('./Publication')
      , User: require('./User')
      }

// create successor relationships
// note, successor schema must be of the form
// successor:
// { A:
//   { title: 'A'
//   , ...
//   }
// , B:
//   { title: 'B'
//   , ...
//   }
// }
// if titles don't match keys, schema resolution fucks up

_.forEach
  ( Models
  , Model =>
      _.forEach
        ( Model.schema.successors
        , edgeSchema =>
            Model.describeSuccessor(
              { type: Models[edgeSchema.to]
              , title: edgeSchema.title
              , weight: edgeSchema.weight
              })
        )
  )

module.exports = Models;
