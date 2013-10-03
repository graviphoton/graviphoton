/*
 * # Core
 *
 * This module handles basic frontend states like #about, #404, etc...
 * 
 */
Graviphoton.module('Core', function(Core, App, Backbone, Marionette, $, _, JST, mainRegion) {

  Core.WelcomeView = Backbone.Marionette.ItemView.extend({
    template: JST['core/welcome']
  });

  Core.AboutView = Backbone.Marionette.ItemView.extend({
    template: JST['core/about']
  });

  Core.404View = Backbone.Marionette.ItemView.extend({
    template: JST['core/404']
  });

  Core.Controller = Marionette.Controller.extend({
    showWelcome: function() {
      mainRegion.show(new Core.WelcomeView());
    },
    showAbout: function() {
      mainRegion.show(new Core.AboutView());
    },
    show404: function() {
      mainRegion.show(new Core.404View());
    }
  });

  Core.Router = Marionette.AppRouter.extend({
    appRoutes: {
      '': 'showWelcome',
      '404': 'show404',
      'core/about': 'showAbout'
    }
  });

  Core.addInitializer(function() {
    new Core.Router({
      controller: new Core.Controller()
    });
  });

}, JST, Graviphoton.main);
