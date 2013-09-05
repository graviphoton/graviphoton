/**
 * module for representing app modules, ie large modules containing whole subapps
 *
 * @todo this is not in a working order right now
 */
Graviphoton.module('AppModule', function(AppModule, App, Backbone, Marionette, $, _) {

  /**
   * model for a single appmodule
   */
  AppModule.Model = Backbone.Model.extend({
    urlRoot: '/default/appmodule',
    defaults: function() {
      return {
        title: 'new module',
        name: 'new'
      };
    }
  });

  /**
   * List of AppModule models
   */
  AppModule.ModelList = Backbone.Model.extend({
  });

  /**
   * collection of AppModel models
   */
  AppModule.Collection = Backbone.Collection.extend({
    model: AppModule.ModelList,
    url: 'appmodules.json',
    
  });

  AppModule.Router = Marionette.AppRouter.extend({
    appRoutes: {
    }
  });

  AppModule.Controller = Marionette.Controller.extend({
    modules: new AppModule.Collection(),
    start: function () {
      this.modules.fetch();
    }
  });
  /**
   * initialize module
   */
  AppModule.addInitializer(function () {
    var controller = new AppModule.Controller();
    controller.router = new AppModule.Router({
      controller: controller
    });
    controller.start();
  });

});
