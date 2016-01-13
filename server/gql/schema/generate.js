const G = require('graphql');
const _ = require('lodash');

const models = require('../../models/');

const TYPES =
      { 'string': G.GraphQLString
      , 'integer': G.GraphQLInt
      };

const SYSTEMSCHEMA =
  { id: { type: 'integer' }
  // TODO: created_at and updated_at
  // probably as integers?
  }

const propertiesToArgs = properties =>
        _.mapValues
          ( properties
          , info => (
            { type: TYPES[info.type]
            })
          )
      ;

const field = (name, type) => (
      { type: TYPES[type]
      , resolve: p => (console.log(p[name]), p[name])
      })
      ;

module.exports =

  // utilities for generating types
  { field

  , fields: schema =>
      _.mapValues
        ( _.assign({}, SYSTEMSCHEMA, schema.properties)
        , (info, name) => field(name, info.type)
        )

  // utilities for generating root query
  , all: (schema, type) => (
    { type: new G.GraphQLList(type)
    , args: { offset: { type: G.GraphQLInt }
            , limit: { type: G.GraphQLInt }
            }
    , resolve: (__, args) => models[schema.title].all(args)
    })

  , findMany: (schema, type) => (
    { type: new G.GraphQLList(type)
    , args: { ids: { type: new G.GraphQLList(G.GraphQLInt) }
            }
    , resolve: (__, args) => models[schema.title].find(...args.ids)
    })

  , find: (schema, type) => (
    { type
    , args: { id: { type: { type: G.GraphQLInt } }
            }
    , resolve: (__, args) => models[schema.title].find(args.id)
    })

  // utilities for generating root mutation
  , createMutation: (schema, type, defaults, props) => (
    { type
    , args: propertiesToArgs(schema.properties)
    , resolve: (__, args) =>
        models[schema.title].create(_.assign({}, defaults, args))
    })
  , updateMutation(schema, type, props) {
    }
  , deleteMutation(type, props) {
    }

  };
