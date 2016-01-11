'use strict';

module.exports = function(ast, store, r, context) {

  if (!ast || !ast.queries)
    return context.fail({ error: "poop" });

  ast.queries.forEach(query => {

  });

}
