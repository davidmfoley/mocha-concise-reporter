var _ = require('lodash');
var color = require('./color');
var printFailures = require('./printFailures');

module.exports = FengShuiReporter;

function FengShuiReporter(runner) {
  var passes = 0;
  var projectRoot;
  var failures = [];
  var minimal = process.env.MOCHA_FENGSHUI_MODE === 'minimal';

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

  runner.on('end', function(){

    console.error();
    console.error(color('pass', '%d passed'), passes);
    if (failures.length) {
      console.error(color('fail', '%d failed'), failures.length);
    }
    printFailures(failures);
    console.error();
    process.exit(failures.length);
  });
}
