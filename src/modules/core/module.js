/*
 * # Core
 *
 * This module handles basic frontend states like #about, #404, etc...
 * 
 */
Graviphoton.module('Core', function(Core, App, Backbone, Marionette, $, _, JST, mainRegion) {

  /*
   * ## AppDrawerView
   *
   * Display an app in the apps drawer.
   */
  Core.AppDrawerView = Backbone.Marionette.ItemView.extend({
    template: JST['core/app/drawer']
  });

  /*
   * ## WelcomeView
   *
   * contains some boilerplate contents as well as a drawer full
   * of configured apps.
   */
  Core.WelcomeView = Backbone.Marionette.CompositeView.extend({
    template: JST['core/welcome'],
    itemView: Core.AppDrawerView,
    itemViewContainer: ".apps",
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
   * ## AppModel
   *
   * The core app model contains whats needed to setup graviphoton apps.
   */
  Core.AppModel = Backbone.Model.extend({
    defaults: {
      name: "Not specified",
      title: "Not specified",
      description: "",
      showInMenu: false,
      showInDrawer: false
    }
  });

  /*
   * ## AppCollection
   */
  Core.AppCollection = Backbone.Collection.extend({
    model: Core.AppModel,
    url: '../data.json'
  });

  /*
   * ## Controller
   */
  Core.Controller = Marionette.Controller.extend({
    showWelcome: function() {
      appCollection = new Core.AppCollection();
      appCollection.fetch({
        success: function(data) {
          var welcomeView = new Core.WelcomeView({
            collection: data
          });
          mainRegion.show(welcomeView);
        }
      });
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
