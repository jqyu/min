'use strict';

module.exports = {

  enums: {
    UserRole: ['WRITER', 'EDITOR', 'ADMIN']
  },

  types: {

    Publication: {
      fields: {
        id: {
          type: "String",
          notNull: true,
          resolve(parent) {
            return parent.id;
          }
        },
        thumbnail: {
          type: "String",
          resolve(parent) {
            return parent.thumbnail;
          }
        },
        description: {
          type: "String",
          resolve(parent) {
            return parent.description;
          }
        }
      }
    },

    Channel: {

    },

    Item: {

    },

    User: {

    },

    // query types woo
    Query: {
      fields: {
        publication: {
          type: "Publication",
          args: {
            id: {
              type: "String",
              notnull: true
            }
          },
          request(parent, args) {
            // create query object to merge
            return {};
          },
          resolve(parent, args, request) {
            return {};
          }
        }
      }
    },

    // mutation types woo
    Mutation: {

    }

  },
};
