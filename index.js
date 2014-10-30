var _ = require('lodash');
var path = require('path');
var fs = require('fs');

module.exports = FengShuiReporter;

function FengShuiReporter(runner) {
  var passes = 0;
  var projectRoot;
  var failures = [];

  runner.on('start', function(){
    process.stdout.write('\n  '); 
  });

  runner.on('pass', function(test){
    process.stdout.write('.'); 
    passes++;
  });

  runner.on('fail', function(test, err){
    process.stdout.write('F'); 
    failures.push({test: test, err: err});
  });

  runner.on('end', function(){
    console.error();
    console.log('%d passed, %d failed', passes, failures.length);
    printFailures();
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

    console.error(failure.test.fullTitle());

    console.error('  ' + failure.err.message);
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
    return '    ' + location.relative + ":" + location.line + '\n      ' + location.content;
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

}
