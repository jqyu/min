import React from 'react';

import Router, { Redirect, Route, browserHistory } from 'react-router';

import App from './App';
import Example from './Example';

let auth = {
  loggedIn: true
};

function indexRoute(nextState, replaceState) {
  // TODO: dynamic routing depending on user's preferences
  replaceState(null, '/publications/bustle');
}

function requireAuth(nextState, replaceState) {
  auth.loggedIn || replaceState(null, '/login');
}

let Routes = (
  <Router history={browserHistory}>

    <Route path="/" component={Example}/>

    <Route path="/login" component={App} />

    <Route path="/p/:publicationId" component={App} onEnter={requireAuth}>
      <Route path="c" component={App}>
        <Route path="new" component={App} />
        <Route path=":channelId" component={App} />
      </Route>
    </Route>

  </Router>
);

export default Routes;
