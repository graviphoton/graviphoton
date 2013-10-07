/*
 * # Menu
 *
 * Create the following file as data.json in the projects root for test
 * purposes.
 *
 * ````javascript
 * [
 *   {
 *     "name":"core",
 *     "title":"Core",
 *     "showInMenu":true
 *   },
 *   {
 *     "name":"admin",
 *     "title":"Administration",
 *     "showInMenu":true
 *   }
 * ]
 * ````
 */
Graviphoton.module('Menu', function(Menu, App, Backbone, Marionette, $, _, JST, Layout, CoreAppCollection, CoreFilteredCollection) {

  /*
   * ## ItemView
   *
   * view for each menu item
   */
  Menu.ItemView = Backbone.Marionette.ItemView.extend({
    template: JST['menu/item'],
    tagName: 'li',
    className: 'dropdown'
  });

  /*
   * ## EmptyItemView
   *
   * view that gets displayed in case the menu is missing for some reason.
   */
  Menu.EmptyItemView = Backbone.Marionette.ItemView.extend({
    template: JST['menu/empty'],
    tagName: 'li'
  });

  /*
   * ## View
   * 
   * main menu displaying view.
   */
  Menu.View = Backbone.Marionette.CollectionView.extend({
    itemView: Menu.ItemView,
    emptyView: Menu.EmptyItemView,
    tagName: 'ul',
    className: 'nav navbar-nav',
    initialize: function() {
      var errorHandle = this.options.error || console.error;
      this.collection = this.options.collection || console.error("Please pass a collection to Menu.View.");

      this.collection.on("reset", this.render, this);

      this.collection.fetch({
        success: this.options.loaded(this),
        error: errorHandle
      });
    }
  });

  /*
   * initalize a menu view and hand over to layout when done
   */
  Menu.addInitializer(function() {
    new Menu.View({
      collection: new CoreAppCollection(),
      loaded: function(menu) {
        Layout.menuLoaded(menu);
      }
    });
  });

}, JST, Graviphoton.module('Layout'), Graviphoton.module('Core').AppCollection, Graviphoton.module('Core').FilteredCollection);
