'use strict';

const config = require('./config/environment');

// websocket server
// - used to push subscriptions to clients

// http server
require('./server/http')(config.http);
