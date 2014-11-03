var tty = require('tty');
var isatty = tty.isatty(1) && tty.isatty(2);
var useColors = isatty || (process.env.MOCHA_COLORS !== undefined);

var colors = {
  'local file': 93,
  'local content': 36,
  'local line': 94,
  'local location': 91,
  'local call': 91,
  'nonlocal file': 90,
  'nonlocal content': 90,
  'nonlocal line': 90,
  'nonlocal location': 90,
  'nonlocal call': 90,
  fail: 31,
  pass: 32,
  pending: 93,
  context: 39,
  title: 39,
  message: 31,
  summary: 93
};

module.exports = function color(type, str) {
  if (!useColors) return str;
  if (!colors[type]) return str;
  return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
};
