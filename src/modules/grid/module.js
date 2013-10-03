/*
 * # Grid
 *
 * Module containing basic grid components.
 *
 */
Graviphoton.module('Grid', function(Grid, App, Backbone, Marionette, $, _, JST, mainRegion) {

  /*
   * ## MainView
   */
  Grid.MainView = Backbone.Marionette.ItemView.extend({
    template: JST['grid/main'],
  });

  /*
   * ## Initializer
   */
  Grid.addInitializer(function() {
    mainRegion.show(new Grid.MainView());
  });


}, JST, Graviphoton.main);
