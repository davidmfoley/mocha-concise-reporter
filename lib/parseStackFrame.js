var path = require('path');
var fs = require('fs');

module.exports = function parseStackFrame(frame, projectRoot) {
  var match = /\((.+)\)/.exec(frame);
  var filename;
  var call;
  if (!match) {
    var pieces = frame.trim().split(' ');
    if (pieces.length) {
      filename = pieces[pieces.length - 1];
      call = null;
    }
    else {
      return {raw: frame};
    }
  }
  else {
    filename = match[1];
    var others = frame.substring(0, frame.indexOf('(')).trim().split(' ');

    call = others[others.length - 1];
  }

  var namePieces = filename.split(':');
  var absolute = namePieces[0];
  var relative = path.relative(projectRoot, absolute);
  var line = namePieces[1];

  return {
    call: call,
    raw: frame,
    relative: relative,
    absolute: absolute,
    line: line,
    content: readLine(absolute, line)
  };
};

function readLine(file, line) {
  var content;
  var lines;
  try {
    content = fs.readFileSync(file).toString();
    lines = content.split('\n');
    return lines[line - 1].trim();
  }
  catch(err) {
    return null;
  }
}
