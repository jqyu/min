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

const idArg = name => (name.toLowerCase() + 'Id')

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
    , resolve: (__, args) => models[schema.title].find(args.id).get(0)
    })

    // TODO: support querying successors by/with weights
  , successors: (schema, name, type) => (
    { type: new G.GraphQLList(type)
    , args:
        { offset: { type: G.GraphQLInt }
        , limit: { type: G.GraphQLInt }
        }
    , resolve: (obj, args) =>
        models[schema.title].getSuccessors(schema.successors[name].title, obj.id, args)
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
  , createEdgeMutation: (schema, name, wName) => (
    { type: G.GraphQLString
    , args: propertiesToArgs
            ( _.fromPairs(_.compact(
              [ [ idArg(schema.title), { type: 'id' } ]
              , [ idArg(schema.successors[name].to), { type: 'id' } ]
              , schema.successors[name].weight
                && [ wName, { type: TYPES[schema.successors[name].weight] } ]
              ]))
            )
    , resolve: (__, args) =>
        models[schema.title]
          .addSuccessor
            ( name
            , args[idArg(schema.title)]
            , args[idArg(schema.successors[name].to)]
            , args[wName]
            )
          .then(() => "OK")
    })
  , deleteEdgeMutation: (schema, name) => (
    { type: G.GraphQLString
    , args: propertiesToArgs
            ( _.fromPairs(
              [ [ idArg(schema.title), { type: 'id' } ]
              , [ idArg(schema.successors[name].to), { type: 'id' } ]
              ])
            )
    , resolve: (__, args) =>
        models[schema.title]
          .removeSuccessor
            ( name
            , args[idArg(schema.title)]
            , args[idArg(schema.successors[name].to)]
            )
          .then(() => "OK")
    })

  }
