/*
 * # Layout
 *
 * handles header and footer contents.
 *
 * The layout module takes care of adding some contents to the header and footer
 * of the page.
 */
Graviphoton.module('Layout', function(Layout, App, Backbone, Marionette, $, _, Graviphoton, JST) {

  /*
   * ## Header
   *
   * The layout header has a region for the menu.
   */
  Layout.Header = Backbone.Marionette.Layout.extend({
    template: JST['layout/header'],
    regions: {
      menu: "#menu"
    }
  });

  Layout.Main = Backbone.Marionette.ItemView.extend({
    template: JST['layout/main'],
  });

  /*
   * ## Footer
   *
   * The footer is very simpl and only consists of a template.
   */
  Layout.Footer = Backbone.Marionette.ItemView.extend({
    template: JST['layout/footer'],
  });

  /*
   * ## menuLoaded
   *
   * Called when the menu has finished loading.
   *
   * @todo replace call with a serious event?
   */
  Layout.menuLoaded = function(menu) {
    this._headerLayout.menu.show(menu);
  };

  /*
   * ## Initializer
   *
   * Show header and footers.
   */
  Layout.addInitializer(function() {
    this._headerLayout = new Layout.Header();

    Graviphoton.header.show(this._headerLayout);
    Graviphoton.main.show(new Layout.Main());
    Graviphoton.footer.show(new Layout.Footer());
  });

}, Graviphoton, JST);
