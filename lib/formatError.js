var deepDiff = require('deep-diff').diff;
var color = require('./color');


module.exports = function formatError(err) {
  var actual = err.actual;
  var expected = err.expected;
  var formatted = '    ' + color('message', err);

  if (typeof actual === 'object' && typeof expected === 'object') {
    return formatted + '\n' + formatDiff(actual, expected);
  }

  return formatted;
};

function formatDiff(actual, expected) {
  var diff = deepDiff(actual, expected);
  return diff.map(formatDiffLine).filter(function(l) { return l; }).map(indent.bind(null, 8)).join('\n');
}

function indent(spaces, s) {
  var space = '';
  for (var i=0; i< spaces; i++) space += ' ';
  return s.split('\n').map(line => space + line).join('\n')
}

function formatDiffLine(line) {
  var path = (line && line.path && (line.path.map(colorPathPiece).join('.')) || '');
  switch (line.kind) {
    case 'D':
    case 'N':
    case 'E':
      var lhs = formatValue(line.lhs);
      var rhs = formatValue(line.rhs);
      if (typeof line.lhs === 'object' || typeof line.rhs === 'object') {
        lhs = '\n' + lhs;
        rhs = '\n   ' + rhs + '\n';
      }
      else {
        rhs = rhs + ' ';
      }
      return path + ': expected ' +  rhs + 'but got ' + lhs;
    case 'A':
      return formatDiffLine(Object.assign({ path: ['[' + line.index + ']'] },line.item));
    default:
      return '';
  }
}

function colorPathPiece(piece) {
  return color('diff path piece', piece);
}

function formatValue(v) {
  if (typeof v === 'undefined') return color('undefined diff value', 'undefined');
  if (typeof v === 'null') return color('null diff value', 'null');
  if (typeof v === 'object') {
    var stringified = JSON.stringify(v, null, '  ');
    return color('diff value', indent(4, stringified));
  }
  return color('diff value', v);
}
