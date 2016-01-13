// get nodes


const Models =
      { User: require('./User')
      , Publication: require('./Publication')
      };

const Edges =
      [ { from: 'User'
        , to: 'Publication'
        , name: 'canedit'
        , weight: null
        }
      ];

function buildEdges() {

}

// create edges

module.exports = Models;
