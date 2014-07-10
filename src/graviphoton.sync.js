var defaultSync = Backbone.sync;

Backbone.sync = function(method, model, options) {
  var url = _.isFunction(model.url) ? model.url() : model.url;

  options.url = Graviphoton.getUrl(url);

  // Let normal Backbone.sync do its thing
  return defaultSync.call(this, method, model, options);
};

Graviphoton.getUrl = function(url) {
  // hacky workaround to get this initialized early, gets replaced with real config on later calls
  if (typeof Graviphoton.config == 'undefined') {
    Graviphoton.config = { base: '' };
  }

  leadingSlash = '';
  if (url.indexOf('/') !== 0) {
    leadingSlash = '/';
  }

  if (url) {  // If no url, don't override, let Backbone.sync do its normal fail
    url = Graviphoton.config.base + leadingSlash + url;
  }
  return url;
};
