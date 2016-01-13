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
      , { // additional fields go here
        }
      )
  })

const UserType = new G.GraphQLObjectType(
  { name: 'UserType'
  , fields: () => _.assign( generate.fields(User.schema) )
  })

const RootQueryType = new G.GraphQLObjectType(
  { name: 'RootQueryType'
  , fields: () => (
    { users: generate.all(User.schema, UserType)
    , publications: generate.all(Publication.schema, PublicationType)
    })
  });

const RootMutationType = new G.GraphQLObjectType(
  { name: 'RootMutationType'
  , fields:
    { createUser:
      { type: UserType
      , args:
        { name: { type: G.GraphQLString }
        , thumbnail: { type: G.GraphQLString }
        }
      , resolve: (_, args) => User.create(
        { name: args.name || 'noname'
        , thumbnail: args.thumbnail || '#FF0099'
        })
      }
    , createPublication:
      { type: PublicationType
      , args:
        { name: { type: G.GraphQLString }
        , thumbnail: { type: G.GraphQLString }
        }
      }
    }
  });

const schema = new G.GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

module.exports = schema;
