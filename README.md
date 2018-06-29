## Concise Reporter for Mocha

A slimmed down reporter for mocha that prints USEFUL stack traces:

* Focuses on code by hiding or de-emphasizing stack frames in other modules or the mocha test framework itself
* Displays the contents of the line of code referenced in each frame

(See below for examples of output)

### install it:

```npm install mocha-concise-reporter --save-dev```

### to use it, use mocha's -R/--reporter argument:

```./node_modules/.bin/mocha test -R mocha-concise-reporter ```


#### configuration of the reporter mode

The output mode for stack traces is set via env variable `MOCHA_CONCISE_MODE` or reporter option "mode" (`-O` option on mocha command line).

possible values:

* default

  - display (gray) stack frames from npm modules and node internals
  - highlight stack frames from the local module

```./node_modules/.bin/mocha test -R mocha-concise-reporter ```

* minimal

  - only display stack frames from the local module (just 'my code')

```MOCHA_CONCISE_MODE=minimal ./node_modules/.bin/mocha test -R mocha-concise-reporter ```

```./node_modules/.bin/mocha test -R mocha-concise-reporter -O mode=minimal```

#### Example "minimal" output
![Example Minimal](docs/minimal.png)

####Example "default" output
![Example Default](docs/default.png)

