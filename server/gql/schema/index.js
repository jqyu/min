const G = require('graphql');
const _ = require('lodash');

const generate = require('./generate');

const models = require('../../models/');

const Channel = models.Channel;
const Publication = models.Publication;
const User = models.User;

const ChannelType = new G.GraphQLObjectType(
  { name: 'ChannelType'
  , fields: () => _.assign
    ( generate.fields(Channel.schema)
    )
  })

const PublicationType = new G.GraphQLObjectType(
  { name: 'PublicationType'
  , fields: () => _.assign
      ( generate.fields(Publication.schema)
      , { channels: generate.successors
            ( Publication.schema
            , Publication.schema.successors.contains
            , ChannelType
            )
        }
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
      , resolve: () => User.find(1).get(0)
      }
    , users: generate.all(User.schema, UserType)
    , user: generate.find(User.schema, UserType)
    , publications: generate.all(Publication.schema, PublicationType)
    , publication: generate.find(Publication.schema, PublicationType)
    , channel: generate.find(Channel.schema, ChannelType)
    })
  });

const RootMutationType = new G.GraphQLObjectType(
  { name: 'RootMutationType'
  , fields:

    // USER
    { createUser: generate.createMutation
        ( User.schema
        , UserType
        , { name: 'no name'
          , thumbnail: '#FF0099'
          }
        )
    , updateUser: generate.updateMutation
        ( User.schema
        , UserType
        )

    , allowEdit: generate.createEdgeMutation
        ( User.schema
        , User.schema.successors.canedit
        , 'userId'
        , 'publicationId'
        )

    // PUBLICATION
    , createPublication: generate.createMutation
        ( Publication.schema
        , PublicationType
        , { name: 'no name'
          , thumbnail: '#FF0099'
          }
        )
    , attachChannel: generate.createEdgeMutation
        ( Publication.schema
        , Publication.schema.successors.contains
        , 'publicationId'
        , 'channelId'
        )

    // CHANNEL
    , createChannel: generate.createMutation
        ( Channel.schema
        , ChannelType
        , { name: 'no name'
          , thumbnail: '#FF0099'
          }
        )

    }
  });

module.exports =  new G.GraphQLSchema(
  { query: RootQueryType
  , mutation: RootMutationType
  });
