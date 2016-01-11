'use strict';

const path = require('path');
const express = require('express');

const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.set('json spaces', 2);

const gql = require('./gql/');

var paths = {
  statics: '/public',
  app: '/dist',
  main: '/dist/index.html'
}

// make paths absolute
for (var key in paths) {
  paths[key] = path.join(__dirname, '../', paths[key]);
}

module.exports = function(config) {
  app.use(express.static(paths.statics));
  app.use(express.static(paths.app));

  // call graphQL function
  function handle(req, res) {
    let params = req.body;
    let context = {
      succeed: obj => res.json(obj),
      fail: obj => res.json(obj)
    };
    gql.handler(params, context);
  };

  app.get('/graphql', handle);
  app.post('/graphql', handle);

  // catch default route
  // TODO: prerender
  app.get('*', (req, res) => res.sendFile(paths.main));

  const server = app.listen(config.port, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(`the min listening at http://${host}:${port}`);
  });
}
