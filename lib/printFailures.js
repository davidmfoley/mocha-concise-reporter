var path = require('path');
var fs = require('fs');
var parseStackFrame = require('./parseStackFrame');
var color = require('./color');
var formatLocation = require('./formatLocation');
var formatError = require('./formatError');

module.exports = function printFailures(failures) {
  var byContext = {};
  failures.forEach(function(failure) {
    byContext[failure.context] = byContext[failure.context] || [];
    byContext[failure.context].push(failure);
  });

  Object.keys(byContext).forEach(function(context) {
    console.error(color('context', context));
    byContext[context].forEach(printFailure);
  });
};

function printFailure(failure) {
  var testLocation = failure.test.file;
  var projectRoot = findProjectRoot(testLocation);
  var frames = failure.err.stack.split('\n').slice(1, 13);

  console.error(color('title', '  ' + failure.test.title));

  console.error(formatError(failure.err));

  frames.forEach(printFrame);
  console.error();

  function printFrame(frame) {
    var location = parseStackFrame(frame, projectRoot);

    var fmt = formatLocation(location);
    if (fmt) {
      console.error(fmt);
    }
  }

  function findProjectRoot(location) {
    if (!location) return '/';
    var dir = path.dirname(location);
    while (dir.length > 2) {
      if (fs.existsSync(path.join(dir, 'package.json'))) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return path.dirname(location);
  }
}

