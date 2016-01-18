const G = require('graphql')
const _ = require('lodash')

const models = require('../../models/')

const TYPES =
      { 'string': G.GraphQLString
      , 'integer': G.GraphQLInt
      , 'id': new G.GraphQLNonNull(G.GraphQLInt)
      }

const RootSchema =
      { id: { type: 'integer' }
      , created_at: { type: 'integer' }
      , updated_at: { type: 'integer' }
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

// convenience functions
const model = name =>
        models[name]
const schema = name =>
        models.schemas[name]
const edge = (p, e) =>
        models.schemas[p].successors[e]
const req = (p) =>
        p.rootValue.req
const idArg = name =>
        (name.toLowerCase() + '_id')

module.exports = function(Types) {

  const type = name => Types[name]

  // utilities for generating types

  return { // fucking ASI doesn't like comma first style ]:

    field

  , fields: (name, extra) =>
      _.assign
        ( _.mapValues
          ( _.assign({}, RootSchema, schema(name).properties)
          , (info, name) => field(name, info.type)
          )
        , extra
        )

    // TODO: support querying successors by/with weights
  , successors: (p, name, s) => (
    { type: new G.GraphQLList(type(s))
    , args:
        { offset: { type: G.GraphQLInt }
        , limit: { type: G.GraphQLInt }
        }
    , resolve: (obj, args, env) => req(env).getSuccessors(p, name, obj.id, args)
    })
  , successor: (p, name, s) => (
    { type: type(s)
    , resolve: obj => req(env).getSuccessors(p, name, obj.id).get(0)
    })

  , predecessors: (p, name, s) => (
  { type: new G.GraphQLList(type(p))
  , args:
      { offset: { type: G.GraphQLInt }
      , limit: { type: G.GraphQLInt }
      }
  , resolve: (obj, args, env) => req(env).getPredecessors(s, name, obj.id, args)
  })
  , predecessor: (p, name, s) => (
  { type: type(p)
  , resolve: (obj, __, env) => req(env).getPredecessors(s, name, obj.id).get(0)
  })

  // utilities for generating root query
  , all: name => (
    { type: new G.GraphQLList(type(name))
    , args:
        { offset: { type: G.GraphQLInt }
        , limit: { type: G.GraphQLInt }
        }
    , resolve: (__, args, env) => req(env).all(name, args)
    })

  , findMany: name => (
    { type: new G.GraphQLList(type(name))
    , args:
        { ids: { type: new G.GraphQLList(G.GraphQLInt) }
        }
    , resolve: (__, args, env) => req(env).find(name, ...args.ids)
    })

  , find: name => (
    { type: type(name)
    , args: IdentifierArgs
    , resolve: (__, args, env) => req(env).find(name, [args.id]).get(0)
    })


  // utilities for generating root mutation
    // TODO: default resolution (i.e. functions that resolve to, for example, current session id)
    // TODO: infer static defaults and requireds from schema
  , createMutation: (name, defaults, fields) => (
    { type: type(name)
    , args: propertiesToArgs(schema(name).properties, fields)
    , resolve: (__, args, env) => req(env).create(name, _.assign({}, defaults, args))
    })
  , updateMutation: (name, fields) => (
    { type: type(name)
    , args: _.assign
        ( IdentifierArgs
        , propertiesToArgs(schema(name).properties, fields)
        )
    , resolve: (__, args, env) => req(env).update(name, args.id, args)
    })
  , deleteMutation: name => (
    { type: type(name)
    , args: IdentifierArgs
    , resolve: (__, args, env) => req(env).delete(name, args.id)
    })

  // TODO: resolvable defaults (default lambdas ??)
  // don't allow extended props; better to write a custom mutation in that case
  , createEdgeMutation: (p, name, s, pName, sName, wName) => (
    { type: G.GraphQLString
    , args: propertiesToArgs
            ( _.fromPairs(_.compact(
              [ [ pName || idArg(p), { type: 'id' } ]
              , [ sName || idArg(s), { type: 'id' } ]
              , edge(p, name).weight
                && [ wName || "weight", { type: TYPES[edge(p, name).weight] } ]
              ]))
            )
    , resolve: (__, args, env) =>
        req(env).addSuccessor
          ( p, name
          , args[ pName || idArg(p) ]
          , args[ sName || idArg(s) ]
          , args[ wName || "weight" ]
          )
          .then(() => "OK")
    })
  , deleteEdgeMutation: (p, name, s, pName, sName) => (
    { type: G.GraphQLString
    , args: propertiesToArgs
            ( _.fromPairs(
              [ [ pName || idArg(p), { type: 'id' } ]
              , [ sName || idArg(s), { type: 'id' } ]
              ])
            )
    , resolve: (__, args, env) =>
        req(env).removeSuccessor
          ( p, name
          , args[ pName || idArg(p) ]
          , args[ sName || idArg(s) ]
          )
          .then(() => "OK")
    })

  }

}
