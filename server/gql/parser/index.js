'use strict';

const tokenize = require('./tokenize');

// TODO:
// fragments
// variables
// other sundry context things

module.exports = function(string, context) {

  const tokens = tokenize(string);
  var cursor = 0;
  var token = tokens[0];
  var end = tokens.length;
  var r = {
    queries: [],
    mutations: [],
    subscriptions: []
  };

  function error(type, payload) {
    var error;
    switch (type) {
      case 'EXPECTED':
        error = "Expected " + payload;
        break;
      case 'EOF':
        error = "Unexpected EOF"
        break;
      default:
        error = "Unexpected token";
        break;
    }
    throw {
      r,
      errors: [ `Parsing error: ${error} at token: ${cursor}` ]
    };
  };

  function nextToken() {
    token = (cursor <= end) && tokens[++cursor];
    return token;
  }

  function parseToken(strict, t) {
    if (token != t)
      return strict && error('EXPECTED', t);
    nextToken();
    return t;
  }

  function parseWord(strict) {
    var word = token;
    if (word.charAt(0) == '#' || word.charAt(0) == ',')
      return strict && error('EXPECTED', 'word');
    nextToken();
    return word;
  }

  function parseLiteral(strict) {
    var t = token;
    if (t.charAt(0) == ',') {
       t = t.substring(1);
       nextToken();
       return t;
    }
    if (token == 'true') {
      nextToken();
      return true;
    }
    if (token == 'false') {
      nextToken();
      return false;
    }
    if (token == 'null') {
       nextToken();
       return null;
    }
    if (!isNaN(t)) {
      nextToken();
      return +t;
    }
    if (parseToken(false, '#LSQUARE')) {
      var r= [];
      while (token && token != '#RSQUARE')
        r.push(parseLiteral(true));
      parseToken(true, '#RSQUARE');
      return r;
    }
    var e = parseWord(strict);
    return e && { e }; // enum
  }

  function parseParams() {

    if (!parseToken(false, '#LPAREN'))
      return null;

    var r = {};
    while (token != '#RPAREN')
      r[parseWord(true)] = parseToken(true, '#COLON') && parseLiteral(true);

    parseToken(true, '#RPAREN');


    return r;
  }

  function parseNode(strict) {
    var name = parseWord(true);
    var params = parseParams();
    var fields = parseBlock();

    return {
      name, params, fields
    };
  }

  function parseBlock(strict) {

    if (!parseToken(strict, '#LBRACE'))
      return null;

    var r = [];
    while (token && token != '#RBRACE') {
      r.push(parseNode());
    }

    parseToken(true, '#RBRACE');

    return r;
  }

  function parseRootNode(type, name, params) {

    var block = parseBlock(true);

    var rootNode = {
      name: name,
      params: params,
      fields: block
    };

    r[type].push(rootNode);
    return true;

  }

  try {
    while (token) {
      var name = null;
      var params = null;
      switch (token) {
        // PARSE A QUERY
        case 'query':
          nextToken(); // chomp
          name = parseWord(false);
        case '#LBRACE':
          name = name || 'Query';
          parseRootNode('queries', name, params);
          break;

        // PARSE A MUTATION
        case 'mutation':
          nextToken(); // chomp
          name = parseWord(false);
          name = name || 'Mutation';
          parseRootNode('mutations', name, params);
          break;
        case 'subscription':
          nextToken(); // chomp
          name = parseWord(false);
          name = name || 'Subscription';
          parseRootNode('subscriptions', name, params);
          break;

        default:
          return error('EXPECTED:OPERATION');
      }
    }
  } catch (e) {
    context.fail(e);
    console.log('hello the error is:', e);
    return null;
  }

  return r;

};
