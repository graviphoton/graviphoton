/**
 * Layout Module handles header and footer contents
 *
 * @todo integrate AppModule properly so we can display a nice navi in the header.
 */
Graviphoton.module('Layout', function(Layout, App, Backbone, Marionette, $, _, AppModule, AppModuleCollection) {

  Layout.Header = Backbone.Marionette.ItemView.extend({
    template: '#template-header',
    initialize: function() {
      //this.listenTo(AppModuleCollection, "change", this.reset);
    }
  });

  Layout.Footer = Backbone.Marionette.ItemView.extend({
    template: '#template-footer',
  });

  console.debug('Layout loaded:', this);
}, Graviphoton.module('AppModule').Model, Graviphoton.module('AppModule').Collection);

// display header and footer on app start
Graviphoton.module('Layout').on("start", function(){
  Graviphoton.header.show(new Graviphoton.Layout.Header());
  Graviphoton.footer.show(new Graviphoton.Layout.Footer());
  console.debug('Layout started:', this);
});


