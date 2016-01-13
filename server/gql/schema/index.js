const G = require('graphql');
const _ = require('lodash');

const generate = require('./generate');

const models = require('../../models/');
const User = models.User;
const Publication = models.Publication;

const PublicationType = new G.GraphQLObjectType(
  { name: 'PublicationType'
  , fields: () => _.assign
      ( generate.fields(Publication.schema)
      )
  })

const UserType = new G.GraphQLObjectType(
  { name: 'UserType'
  , fields: () => _.assign
      ( generate.fields(User.schema)
      , { canedit: generate.successors
          ( User.schema
          , User.schema.successors.canedit
          , PublicationType
          )
        }
      )
  })

const RootQueryType = new G.GraphQLObjectType(
  { name: 'RootQueryType'
  , fields: () => (
    { me: // hypothetically used to resolve current session
      { type: UserType
      , resolve: () => User.find(1)
      }
    , users: generate.all(User.schema, UserType)
    , publications: generate.all(Publication.schema, PublicationType)
    })
  });

const RootMutationType = new G.GraphQLObjectType(
  { name: 'RootMutationType'
  , fields:
    { createUser: generate.createMutation
        ( User.schema
        , UserType
        , { name: 'no name'
          , thumbnail: '#FF0099'
          }
        )
    , createPublication: generate.createMutation
        ( Publication.schema
        , PublicationType
        , { name: 'no name'
          , thumbnail: '#FF0099'
          }
        )
    , allowEdit: generate.createEdgeMutation
        ( User.schema
        , User.schema.successors.canedit
        , 'userId'
        , 'publicationId'
        )
    }
  });

module.exports =  new G.GraphQLSchema(
  { query: RootQueryType
  , mutation: RootMutationType
  });
