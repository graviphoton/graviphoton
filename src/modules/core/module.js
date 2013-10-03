/*
 * # Core
 *
 * This module handles basic frontend states like #about, #404, etc...
 * 
 */
Graviphoton.module('Core', function(Core, App, Backbone, Marionette, $, _, JST, mainRegion) {

  /*
   * ## WelcomeView
   *
   * preliminiary contents of welcome page.
   */
  Core.WelcomeView = Backbone.Marionette.ItemView.extend({
    template: JST['core/welcome']
  });

  /*
   * ## AboutView
   *
   * Page you get to see when the user hits about.
   */
  Core.AboutView = Backbone.Marionette.ItemView.extend({
    template: JST['core/about']
  });

  /*
   * ## FourOhFourView
   *
   * run off the mill 404 page
   */
  Core.FourOhFourView = Backbone.Marionette.ItemView.extend({
    template: JST['core/404']
  });

  /*
   * ## Controller
   */
  Core.Controller = Marionette.Controller.extend({
    showWelcome: function() {
      mainRegion.show(new Core.WelcomeView());
    },
    showAbout: function() {
      mainRegion.show(new Core.AboutView());
    },
    show404: function() {
      mainRegion.show(new Core.FourOhFourView());
    }
  });

  /*
   * ## Router
   */
  Core.Router = Marionette.AppRouter.extend({
    appRoutes: {
      '': 'showWelcome',
      '404': 'show404',
      'core/about': 'showAbout'
    }
  });

  /*
   * ## Initializer
   */
  Core.addInitializer(function() {
    new Core.Router({
      controller: new Core.Controller()
    });
  });

}, JST, Graviphoton.main);
