const G = require('graphql');
const _ = require('lodash');

const Types =
      { ChannelType: null
      , ItemType: null
      , PublicationType: null
      , UserType: null
      }

const generate = require('./generate')(Types);

Types.Channel = new G.GraphQLObjectType(
  { name: 'ChannelType'
  , fields: () => generate.fields
      ( 'Channel'
      , { items: generate.successors ( 'Channel', 'has' , 'Item' )
        }
      )
  })

Types.Item = new G.GraphQLObjectType(
  { name: 'ItemType'
  , fields: () => generate.fields
      ( 'Item'
      , { author: generate.predecessor ( 'User' , 'posted' , 'Item' )
        }
      )
  })

Types.Publication = new G.GraphQLObjectType(
  { name: 'PublicationType'
  , fields: () => generate.fields
      ( 'Publication'
      , { channels: generate.successors ( 'Publication' , 'has' , 'Channel')
        }
      )
  })

Types.User = new G.GraphQLObjectType(
  { name: 'UserType'
  , fields: () => generate.fields
      ( 'User'
      , { canedit: generate.successors ( 'User' , 'canedit' , 'Publication')
        , posted: generate.successors ( 'User' , 'posted' , 'Item' )
        }
      )
  })

const RootQueryType = new G.GraphQLObjectType(
  { name: 'RootQueryType'
  , fields: () => (
    { me: // hypothetically used to resolve current session
      { type: Types.User
      , resolve: (__, ___, env) => env.rootValue.req.get('User', 1)
      }

    , users: generate.all('User')
    , userList: generate.findMany('User')
    , user: generate.find('User')

    , publications: generate.all('Publication')
    , publicationList: generate.findMany('Publication')
    , publication: generate.find('Publication')

    , channels: generate.all('Channel')
    , channelList: generate.findMany('Channel')
    , channel: generate.find('Channel')

    , items: generate.all('Item')
    , publicationList: generate.findMany('Item')
    , item: generate.find('Item')
    })
  });

const RootMutationType = new G.GraphQLObjectType(
  { name: 'RootMutationType'
  , fields: () => (

    // USER
    { createUser: generate.createMutation
        ( 'User' , { name: 'no name' , thumbnail: '#FF0099' } )
    , updateUser: generate.updateMutation('User')
    , deleteUser: generate.deleteMutation('User')
    // USER EDGE MUTATIONS
    , allowEdit: generate.createEdgeMutation( 'User', 'canedit', 'Publication' )

    // PUBLICATION
    , createPublication: generate.createMutation
        ( 'Publication' , { name: 'no name' , thumbnail: '#FF0099' } )
    , updatePublication: generate.updateMutation('Publication')
    , deletePublication: generate.deleteMutation('Publication')
    // PUBLICATION EDGE MUTATIONS
    , attachChannel: generate.createEdgeMutation( 'Publication', 'has', 'Channel' )

    // CHANNEL
    , createChannel: generate.createMutation
        ( 'Channel' , { name: 'no name' , thumbnail: '#FF0099' } )
    , updateChannel: generate.updateMutation('Channel')
    , deleteChannel: generate.deleteMutation('Channel')
    , attachItem: generate.createEdgeMutation( 'Channel', 'has', 'Item' )

    // ITEM
    , createItem: generate.createMutation
        ( 'Item' , { title: 'untitled' , thumbnail: '#FF0099' , url: 'http://bustle.com' } )
    , updateItem: generate.updateMutation('Item')
    , deleteItem: generate.deleteMutation('Item')
    , attributeUser: generate.createEdgeMutation( 'User', 'posted', 'Item' )

    })
  });

module.exports =  new G.GraphQLSchema(
  { query: RootQueryType
  , mutation: RootMutationType
  });
