const G = require('graphql');

const models = require('../models/')
const schema = require('./schema/');
const request = require('./request');

module.exports.handler = function(params, context) {

  var query = params.request
  var req = request(models.User._redis)

  console.time("query")
  G.graphql(schema, query, req).then(result => {
    console.timeEnd("query")
    console.log('Executed:');
    console.log(params.request)
    console.log('Result:');
    console.log(result);
    context.succeed(result);
  });

}
