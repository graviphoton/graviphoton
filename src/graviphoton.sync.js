var defaultSync = Backbone.sync;

Backbone.sync = function(method, model, options) {
  var url = _.isFunction(model.url) ? model.url() : model.url;

  if (url) {  // If no url, don't override, let Backbone.sync do its normal fail
    options = options || {};
    options.url = "http://graviton-060.beta.scapp.io" + url;
  }

  // Let normal Backbone.sync do its thing
  return defaultSync.call(this, method, model, options);
};

