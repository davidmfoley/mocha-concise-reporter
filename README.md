##Feng Shui Reporter for mocha

A slimmed down reporter for mocha that prints USEFUL stack traces:

* Focuses on code by hiding or deemphasizing stack frames in other modules or the mocha test framework itself
* Displays the contents of the line of code referenced in each frame

###install it:

```npm install mocha-fengshui-reporter --save-dev```

###to use it, use mocha's -R/--reporter argument:

```./node_modules/.bin/mocha test -R mocha-fengshui-reporter ```

###options

Options are set via env variable:

####MOCHA_FENGSHUI_MODE

possible values: minimal, default

```MOCHA_FENGSHUI_MODE=minimal ./node_modules/.bin/mocha test -R mocha-fengshui-reporter ```
