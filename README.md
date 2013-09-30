# Graviphoton [![Build Status](https://travis-ci.org/graviphoton/ui-core.png?branch=master)](https://travis-ci.org/graviphoton/ui-core)

## Hacking

### Setup machine globally for graviphoton development

````bash
sudo npm install -g bower
sudo npm install -g grunt-cli
````

These npm take care of globally installing the required development tool.
You might need to install ````npm```` using your systems package manager. 
Some distros will need you to run npm as root. If you do not wish to 
install the tools globally you may run ````npm install```` in the git clone
and then use ````bower```` and ````grunt```` from the ````node_modules/````
subdir.

### Install and build graviphoton.

You may pull all frontend dependencies using ````bower````.

````bash
bower install
````

The project then gets built using ````grunt````. This creates minified css, js and less code.

````bash
grunt
````

If running grunt globally does not work for you can use the bundled grunt-cli.

````bash
node_modules/grunt-cli/bin/grunt
````

### Using JST templates

All files in ````src/modules/**/*.tpl```` get compiled to JST templates in ````dist/templates.js````
by running ````grunt jst````. The templates may be used with [underscore](http://underscorejs.org/) like so.

````javascript
var template = JST['core/about']();
var results = _.template(template, {})
````

## Testing

Navigate to ````dist/index.html```` or ````dist/dev.html````. The first one contains thte final
deliverable application that loads minified js and css while the latter loads unminified unconcated
js and css files.

The subdir ````test/```` contains [QUnit](http://qunitjs.com/) tests that may be run using ````grunt qunit````.

## Releasing

Running ````grunt```` creates files in ````dist/````.

## TODO

* finalize appmodule module and integrate with layout header (need to grok backbone models/sync)
* final releng concept
