const G = require('graphql');
const User = require('../../models/User');

const UserType = new G.GraphQLObjectType({
  name: 'UserType',
  fields: {
    name: {
      type: G.GraphQLString,
      resolve(p) {
        return p.name;
      }
    },
    color: {
      type: G.GraphQLString,
      resolve(p) {
        return p.color;
      }
    }
  }
})

const RootQueryType = new G.GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    hello: {
      type: new G.GraphQLList(UserType),
      resolve() {
        return User.all();
      }
    }
  }
});

const RootMutationType = new G.GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    hello: {
      type: UserType,
      resolve() {
        return User.create({ name: 'Dummy', color: 'FF0099' });
      }
    }
  }
});

const schema = new G.GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

module.exports = schema;
