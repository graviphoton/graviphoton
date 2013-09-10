## Install

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

## Testing

Navigate to ````dist/index.html```` or ````dist/dev.html````.

## Releasing

Running ````grunt```` creates files in ````dist/````.

## TODO

* finalize appmodule module and integrate with layout header (need to grok backbone models/sync)
* create dev.html (using templating and contents of gruntfile)
* final releng concept
