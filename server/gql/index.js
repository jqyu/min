'use strict';

let parseAST = require('./parseAST');

module.exports.handler = function (params, context) {
  // code may be long but according to the benchmarks this takes neglible time
  var ast = parseAST(params.request, context);
  context.succeed({ parsed: ast });
};
