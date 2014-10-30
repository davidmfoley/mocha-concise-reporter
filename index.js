var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var tty = require('tty');

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
    frames.shift();

    console.error(color('name', failure.test.fullTitle()));

    console.error('  ' + color('message', failure.err.message));
    printStack(frames);
  }

  function printStack(frames) {

    frames.forEach(printFrame);
  }

  function printFrame(frame) {
    var location = getFrameLocation(frame);

    var fmt = formatLocation(location);
    if (fmt) {
      console.error(fmt);
    }
  }

  function getFrameLocation(frame) {
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
    if (isMocha(location.absolute)) {
      return;
    }
    var local = isLocal(location.absolute);

    var prefix = local ? 'local ' : 'nonlocal ';

    var message =  '    ' + color(prefix + 'file', location.relative) + ":" + color(prefix  + 'line', location.line);
    if (location.call) {
      message +=  ' - ' + color(prefix + 'call', location.call);
    }
    if (location.content) {
      message += '\n      ' + color(prefix + 'content', location.content);
    }
    return message;
  }

  function isLocal(frame) {
    return frame.indexOf('/') !== -1 && frame.indexOf('node_modules') === -1;
  }

  function isMocha(frame) {
    return frame.indexOf('/mocha/') !== -1;
  }

  function readLine(file, line) {
    try {
      var content = fs.readFileSync(file).toString().split('\n');
      return content[line - 1].trim();
    }
    catch(err) {
      return null;
    }
  }

  function color(type, str) {
    if (!useColors) return str;
    if (!colors[type]) return str;
    return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
  }
}
