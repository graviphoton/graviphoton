/**
 * Single entry point for graviphoton.
 *
 * This Backbone.Marionette.Application manages the applications
 * life cycle as well as defining the core regions that all apps
 * will run in.
 */

var Graviphoton = new Backbone.Marionette.Application();

Graviphoton.addRegions({
  header: '#header',
  main: '#main',
  footer: '#footer'
});

Graviphoton.on('initialize:after', function() {
  // enable back/forward buttons
  Backbone.history.start();
  console.debug('Marionette initialized:', this);
});

