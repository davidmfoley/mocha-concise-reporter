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
  return diff.map(formatDiffLine.bind(null, actual, expected)).filter(function(l) { return l; }).join('\n');
}

function formatDiffLine(actual, expected, line) {
  var path = '      ' + line.path.map(colorPathPiece).join('.');
  switch (line.kind) {
    case 'D':
    case 'N':
    case 'E':
      return path + ': expected ' +  formatValue(line.rhs) + ' but got ' + formatValue(line.lhs);
    case 'A':
      return path + '[' + line.index + ']: arrays differ';
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
  return color('diff value', JSON.stringify(v));
}
