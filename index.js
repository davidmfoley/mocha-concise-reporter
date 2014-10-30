var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var tty = require('tty');

var colors = {
  content: 93,
  line: 94,
  location: 91,
  fail: 31,
  pass: 32,
  name: 92,
  message: 31,
  summary: 93
};

module.exports = FengShuiReporter;

function FengShuiReporter(runner) {
  var passes = 0;
  var projectRoot;
  var failures = [];
  var isatty = tty.isatty(1) && tty.isatty(2);

  var useColors = isatty || (process.env.MOCHA_COLORS !== undefined);

  runner.on('start', function(){
    process.stdout.write('\n');
  });

  runner.on('pass', function(test){
    process.stdout.write(color('pass','.'));
    passes++;
  });

  runner.on('fail', function(test, err){
    process.stdout.write(color('fail', 'F'));
    failures.push({test: test, err: err});
  });

  runner.on('end', function(){
    console.error();
    printFailures();
    console.error();
    if (failures.length) {
      console.error(color('fail', '%d passed, %d failed'), passes, failures.length);
    }
    else {
      console.error(color('pass', '%d passed, %d failed'), passes, failures.length);
    }
    process.exit(failures.length);
  });

  function printFailures() {
    failures.forEach(printFailure);
  }

  function printFailure(failure) {
    console.error();
    var testLocation = failure.test.file;
    projectRoot = findProjectRoot(testLocation);
    var frames = failure.err.stack.split('\n');
    var relevant = _.filter(frames, isLocal);

    console.error(color('name', failure.test.fullTitle()));

    console.error('  ' + color('message', failure.err.message));
    printStack(relevant);
  }

  function isLocal(frame) {
    return frame.indexOf('/') > 0 && !/node\_modules/.test(frame);
  }

  function printStack(frames) {
    frames.forEach(printFrame);
  }

  function printFrame(frame) {
    var location = getFrameLocation(frame);

    console.error(formatLocation(location));
  }

  function getFrameLocation(frame) {
    var match = /\((.+)\)/.exec(frame);
    if (!match) {
      var pieces = frame.trim().split(' ');
      if (pieces.length) {
        return parseLocation(pieces[pieces.length - 1]);
      }
      else {
        return frame;
      }
    }

    return parseLocation(match[1]);
  }

  function parseLocation(location) {
    var pieces = location.split(':');
    var absolute = pieces[0];
    var relative = path.relative(projectRoot, absolute);
    var line = pieces[1];
    return {
      relative: relative,
      absolute: absolute,
      line: line,
      content: readLine(absolute, line)
    };
  }

  function findProjectRoot(location) {
    var dir = path.dirname(location);
    while (dir.length > 2) {
      if (fs.existsSync(path.join(dir, 'package.json'))) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return path.dirname(location);
  }

  function formatLocation(location) {
    return '    ' + color('file', location.relative) + ":" + color('line', location.line) + '\n      ' + color('content', location.content);
  }

  function readLine(file, line) {
    try {
      var content = fs.readFileSync(file).toString().split('\n');
      return content[line - 1].trim();
    }
    catch(err) {
      return '(could not read line)';
    }
  }

  function color(type, str) {
    if (!useColors) return str;
    if (!colors[type]) return str;
    return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
  }
}
