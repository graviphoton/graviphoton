/*
 * # Menu
 *
 * Grabs the installed apps from /core/app and displays the ones with
 * the showInMenu Flag active.
 *
 * showInMenu should return something like the following.
 *
 * ````javascript
 * [
 *   {
 *     "name":"core",
 *     "title":"Core"
 *   },
 *   {
 *     "name":"admin",
 *     "title":"Administration"
 *   }
 * ]
 * ````
 *
 * @todo make this module grab the apps location via RESTful disco from /
 */
Graviphoton.module('Menu', function(Menu, App, Backbone, Marionette, $, _, JST, Layout) {

  /*
   * ## Item 
   */
  Menu.Item = Backbone.Model.extend({
    defaults: {
      name: "Not specified",
      title: "Not specified"
    },
  });

  /*
   * ## ItemCollection
   * 
   * collection of items to be displayed as part of the menu tree.
   *
   * @todo replace url with a service
   */
  Menu.ItemCollection = Backbone.Collection.extend({
    model: Menu.Item,
    url: '/core/app',
  });

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
    initialize: function(options) {
      this.options = options;
      this.errorHandle = this.options.error || console.error;
      this.loadedHandle = this.options.loaded || function() {};
      this.collection = this.options.collection || console.error('Please pass a collection to Menu.View.');

      _.bind(this.fetchData, 'config:loaded');
    },
    fetchData: function() {
      this.collection.fetch({
        success: this.loadedHandle(this),
        error: this.errorHandle
      });
    }
  });

  /*
   * initalize a menu view and hand over to layout when done
   */
  Menu.addInitializer(function() {
    var view = new Menu.View({
      collection: new Menu.ItemCollection(),
      loaded: function(menu) {
        // @todo use events rather than this
        Layout.menuLoaded(menu);
      }
    });
    Graviphoton.on('config:loaded', function() {
      view.fetchData();
    });
  });

}, JST, Graviphoton.module('Layout'));
