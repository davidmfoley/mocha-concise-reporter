var color = require('./color');

module.exports = function formatLocation(location) {
  var minimal = process.env.MOCHA_FENGSHUI_MODE === 'minimal';

  if (isMocha(location.absolute)) {
    return;
  }
  var local = isLocal(location.absolute);

  if (minimal && !local) {
    return;
  }

  var prefix = local ? 'local ' : 'nonlocal ';

  var message =  '      ' + color(prefix + 'file', location.relative) + ":" + color(prefix  + 'line', location.line);
  if (location.call) {
    message +=  ' - ' + color(prefix + 'call', location.call);
  }
  if (location.content) {
    message += '\n        ' + color(prefix + 'content', location.content);
  }
  return message;
};

function isLocal(frame) {
  return frame.indexOf('/') !== -1 && frame.indexOf('node_modules') === -1;
}

function isMocha(frame) {
  return frame.indexOf('/mocha/') !== -1;
}
