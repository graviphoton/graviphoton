/**
 * Layout Module handles header and footer contents
 *
 * @todo integrate AppModule properly so we can display a nice navi in the header.
 */
Graviphoton.module('Layout', function(Layout, App, Backbone, Marionette, $, _, JST) {

  Layout.Header = Backbone.Marionette.ItemView.extend({
    template: JST['layout/header'],
    initialize: function() {
      //this.listenTo(AppModuleCollection, "change", this.reset);
    }
  });

  Layout.Footer = Backbone.Marionette.ItemView.extend({
    template: JST['layout/footer'],
  });

  console.debug('Layout loaded:', this);
}, JST);

// display header and footer on app start
Graviphoton.module('Layout').on("start", function(){
  Graviphoton.header.show(new Graviphoton.Layout.Header());
  Graviphoton.footer.show(new Graviphoton.Layout.Footer());
  console.debug('Layout started:', this);
});

