const G = require('graphql');
const schema = require('./schema/');

module.exports.handler = function(params, context) {

  var query = params.request;

  console.time("query")
  G.graphql(schema, query).then(result => {
    console.timeEnd("query")
    console.log('Executed:');
    console.log(params.request)
    console.log('Result:');
    console.log(result);
    context.succeed(result);
  });

}
