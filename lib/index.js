var color = require('./color');
var printFailures = require('./printFailures');

module.exports = ConciseReporter;

function ConciseReporter(runner, options) {
  var passes = 0;
  var projectRoot;
  var failures = [];
  var pending = [];

  if (process.env.MOCHA_CONCISE_MODE) {
    options.mode = process.env.MOCHA_CONCISE_MODE;
  }

  runner.on('start', function(){
    process.stdout.write('\n');
  });

  runner.on('pass', function(test){
    process.stdout.write(color('pass','.'));
    passes++;
  });

  runner.on('fail', function(test, err){
    process.stdout.write(color('fail', 'F'));

    var fullTitle = test.fullTitle();
    var context = fullTitle.substring(0, fullTitle.length - test.title.length - 1);

    failures.push({test: test, err: err, context: context});
  });

  runner.on('pending', function(test){
    pending.push(test);
    process.stdout.write(color('pending', 'P'));
  });

  runner.on('end', function(){
    console.error();
    console.error(color('pass', '%d passed'), passes);
    if (pending.length) {
      console.error(color('pending', '%d pending'), pending.length);
    }
    if (failures.length) {
      console.error(color('fail', '%d failed'), failures.length);
      printFailures(failures, options);
      console.error();
    }
    process.exit(failures.length);
  });
}
