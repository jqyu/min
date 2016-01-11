'use strict';

const parseAST = require('./parser/');
const schema = require('./schema/');
const processQueries = require('./query/');

module.exports.handler = function (params, context) {
  // code may be long but according to the benchmarks this takes neglible time
  var ast = parseAST(params.request, context);
  var store = {};
  var r = {};

  processQueries(ast, store, r, context);

  context.succeed({ parsed: ast });
};
