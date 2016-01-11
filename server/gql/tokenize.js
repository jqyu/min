'use strict';

const WHITESPACE = {
  ' ': 'SPACE',
  ',': 'COMMA',
  '\n': 'NEWLINE',
  '\t': 'TAB'
}
const TOKENS = {
  '(': 'LPAREN',
  ')': 'RPAREN',
  ':': 'COLON',
  '{': 'LBRACE',
  '}': 'RBRACE',
  '[': 'LSQUARE',
  ']': 'RSQUARE',
  '"': 'QUOTE'
}


module.exports = function(string) {

  var s = string.trim();
  var cursor = 0;
  var end = s.length;

  function getLiteral() {

  }

  function chomp() {

    var c = s.charAt(cursor);

    // remove whitespace
    // ( also catches EOF, awkward coupling )
    while (WHITESPACE[c] || cursor >= end) {
      c = s.charAt(++cursor);
      if (cursor >= end)
        return false;
    }

    // remove comment
    if (c == '#') {
      do {
        cursor++;
      } while (s.charAt(cursor-1) != '\n');
      return chomp();
    }

    // catch string literals
    if (c == '"') {
      var start = ++cursor;
      do {
        c = s.charAt(++cursor);
        if (c == '\\')
          cursor++;
        if (cursor >= end)
          break;
      } while (c != '"');
      return ','+s.substring(start, cursor++);
    }

    // catch tokens
    var token = TOKENS[c];
    if (token) {
      // catch string literal
      cursor++;
      return '#'+token;
    }

    // catch literal

    // catch word
    var start = cursor;
    do {
       c = s.charAt(++cursor);
       if (cursor >= end)
         break;
    } while (!TOKENS[c] && !WHITESPACE[c]);
    return s.substring(start, cursor);

  }

  var tokenized = [];
  var chunk = chomp();
  while (chunk) {
    tokenized.push(chunk);
    chunk = chomp();
  }

  return tokenized;

}
