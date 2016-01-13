const G = require('graphql')
const _ = require('lodash')

const models = require('../../models/')

const TYPES =
      { 'string': G.GraphQLString
      , 'integer': G.GraphQLInt
      , 'id': new G.GraphQLNonNull(G.GraphQLInt)
      }

const RootRadSchema =
      { id: { type: 'integer' }
      // TODO: created_at and updated_at
      // probably as integers?
      }

const IdentifierArgs =
      { id: { type: new G.GraphQLNonNull(G.GraphQLInt) }
      // TODO: add proper descriptions to everything
      }


const propertiesToArgs = (properties, selection) =>
        _.mapValues
          ( selection
            ? _.pick(properties, selection)
            : properties
          , info => (
            { type: TYPES[info.type] || info.type
            })
          )

const field = (name, type) => (
      { type: TYPES[type] || type
      , resolve: p => p[name]
      })

module.exports =

  // utilities for generating types
  { field

  , fields: schema =>
      _.mapValues
        ( _.assign({}, RootRadSchema, schema.properties)
        , (info, name) => field(name, info.type)
        )

  // utilities for generating root query
  , all: (schema, type) => (
    { type: new G.GraphQLList(type)
    , args:
        { offset: { type: G.GraphQLInt }
        , limit: { type: G.GraphQLInt }
        }
    , resolve: (__, args) => models[schema.title].all(args)
    })

  , findMany: (schema, type) => (
    { type: new G.GraphQLList(type)
    , args:
        { ids: { type: new G.GraphQLList(G.GraphQLInt) }
        }
    , resolve: (__, args) => models[schema.title].find(...args.ids)
    })

  , find: (schema, type) => (
    { type
    , args: IdentifierArgs
    , resolve: (__, args) => models[schema.title].find(args.id)
    })

    // TODO: support querying successors by/with weights
  , successors: (pSchema, eSchema, sType) => (
    { type: new G.GraphQLList(sType)
    , args:
        { offset: { type: G.GraphQLInt }
        , limit: { type: G.GraphQLInt }
        }
    , resolve: (obj, args) =>
        models[pSchema.title].getSuccessors(eSchema.title, obj.id, args)
    })

  // utilities for generating root mutation
    // TODO: resolvable defaults (default lambdas)
  , createMutation: (schema, type, defaults, fields) => (
    { type
    , args: propertiesToArgs(schema.properties, fields)
    , resolve: (__, args) =>
        models[schema.title].create(_.assign({}, defaults, args))
    })
  , updateMutation: (schema, type, fields) => (
    { type
    , args: _.assign
        ( IdentifierArgs
        , propertiesToArgs(schema.properties, fields)
        )
    , resolve: (__, args) =>
        models[schema.title].update(args.id, args)
    })
  , deleteMutation: (type, props) => (
    { type
    , args: IdentifierArgs
    , resolve: (__, args) =>
        models[schema.title].update(args.id)
    })

    // TODO: resolvable defaults (default lambdas)
    // don't allow extended props; better to write a custom mutation in that case
  , createEdgeMutation: (pSchema, eSchema, pName, sName, wName) => (
    { type: G.GraphQLString
    , args: propertiesToArgs
            ( _.fromPairs(_.compact(
              [ [ pName, { type: 'id' } ]
              , [ sName, { type: 'id' } ]
              , eSchema.weight && [ wName, { type: TYPES[eSchema.weight] } ]
              ]))
            )
    , resolve: (__, args) =>
        models[pSchema.title].addSuccessor(eSchema.title, args[pName], args[sName], args[wName])
          .then(() => "OK")
    })
  , deleteEdgeMutation: (pSchema, eSchema, pName, sName) => (
    { type: G.GraphQLString
    , args: propertiesToArgs
            ( _.fromPairs(
              [ [ pName, { type: 'id' } ]
              , [ sName, { type: 'id' } ]
              ])
            )
    , resolve: (__, args) =>
        models[pSchema.title].removeSuccessor(eSchema.title, args[pName], args[sName])
          .then(() => "OK")
    })

  }
