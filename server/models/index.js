const _ = require('lodash');

// get nodes
// Note: key must match the "title" field of the respective schemas
// otherwise the object associations fuck up

const Models =
      { Channel: require('./Channel')
      , Item: require('./Item')
      , Publication: require('./Publication')
      , User: require('./User')
      }

// create successor relationships
// NOTE: this mutates the "title" property of each edge schema
// to aid with auto-generation of GraphQL Schema

_.forEach
  ( Models
  , Model =>
      _.forEach
        ( Model.schema.successors
        , (edgeSchema, name) =>
            _.set(edgeSchema, 'title', name) &&
            Model.describeSuccessor(
              { type: Models[edgeSchema.to]
              , title: name
              , weight: edgeSchema.weight
              })
        )
  )

module.exports = Models;
