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

// convenience functions
const model = name =>
        models[name]
const schema = name =>
        models[name].schema
const edge = (p, e) =>
        models[p].schema.successors[e]
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
    , resolve: (obj, args) =>
        model(p).getSuccessors(name, obj.id, args)
    })
  , successor: (p, name, s) => (
    { type: type(s)
    , resolve: obj => model(p).getSuccessors(name, obj.id).get(0)
    })

  , predecessors: (p, name, s) => (
  { type: new G.GraphQLList(type(p))
  , args:
      { offset: { type: G.GraphQLInt }
      , limit: { type: G.GraphQLInt }
      }
  , resolve: (obj, args) =>
      model(s).getPredecessors(name, obj.id, args)
  })
  , predecessor: (p, name, s) => (
  { type: type(p)
  , resolve: obj => model(s).getPredecessors(name, obj.id).get(0)
  })

  // utilities for generating root query
  , all: name => (
    { type: new G.GraphQLList(type(name))
    , args:
        { offset: { type: G.GraphQLInt }
        , limit: { type: G.GraphQLInt }
        }
    , resolve: (__, args) => model(name).all(args)
    })

  , findMany: name => (
    { type: new G.GraphQLList(type(name))
    , args:
        { ids: { type: new G.GraphQLList(G.GraphQLInt) }
        }
    , resolve: (__, args) => model(name).find(...args.ids)
    })

  , find: name => (
    { type: type(name)
    , args: IdentifierArgs
    , resolve: (__, args) => model(name).find(args.id).get(0)
    })


  // utilities for generating root mutation
    // TODO: default resolution (i.e. functions that resolve to, for example, current session id)
    // TODO: infer static defaults and requireds from schema
  , createMutation: (name, defaults, fields) => (
    { type: type(name)
    , args: propertiesToArgs(schema(name).properties, fields)
    , resolve: (__, args) =>
        model(name).create(_.assign({}, defaults, args))
    })
  , updateMutation: (name, fields) => (
    { type: type(name)
    , args: _.assign
        ( IdentifierArgs
        , propertiesToArgs(schema(name).properties, fields)
        )
    , resolve: (__, args) => model(name).update(args.id, args)
    })
  , deleteMutation: name => (
    { type: type(name)
    , args: IdentifierArgs
    , resolve: (__, args) => model(name).delete(args.id)
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
    , resolve: (__, args) =>
        model(p).addSuccessor
          ( name
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
    , resolve: (__, args) =>
        model(p).removeSuccessor
          ( name
          , args[ pName || idArg(p) ]
          , args[ sName || idArg(s) ]
          )
          .then(() => "OK")
    })

  }

}
