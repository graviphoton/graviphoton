/**
 * # Grid
 *
 * Module containg basic grid
 *
 */
Graviphoton.module('Grid', function(Grid, App, Backbone, Marionette, $, _, JST, mainRegion) {

  Backgrid.I18nCell = Backgrid.Cell.extend({
    className: 'i18n-cell',
    formatter: Backgrid.StringFormatter,
    render: function() {
      // copy of same method from Backgrid.StringCell but with .en in the mix
      // @todo use *-language headers to decide which language to use here
      var model = this.model;
      this.$el.html(this.formatter.fromRaw(model.get(this.column.get("name")).en, model));
      return this;
    }
  });

  Grid.url = '';

  Grid.Model = Backbone.Model.extend({});

  Grid.Collection = Backbone.PageableCollection.extend({
    model: Grid.Model,
    url: function() {
      return '/'+Grid.url;
    },
    mode: 'server',
    queryParams: {
      currentPage: 'page',
      pageSize: null
    },
    parseState: function(records, queryParams, state, options) {
      var links = this.parseLinks(records, options);
      var newState = _.clone(state);

      if (links.self) {
        newState.currentPage = parseInt(this.parseUrl(links.self).query.page, 10);
      }
      if (links.first) {
        newState.firstPage = parseInt(this.parseUrl(links.first).query.page, 10);
      }
      if (links.last) {
        newState.lastPage = parseInt(this.parseUrl(links.last).query.page, 10);
        newState.totalPages = newState.lastPage;
      }
      newState.pageSize = 10;

      return newState;
    },
    parseLinks: function(resp, options) {
      // copy of original with added 'last' and 'self' relationship
      var links = {};
      var linkHeader = options.xhr.getResponseHeader("Link");
      if (linkHeader) {
        var relations = ["first", "prev", "next", "last", "self"];
        _.each(linkHeader.split(","), function (linkValue) {
          var linkParts = linkValue.split(";");
          var url = linkParts[0].replace(/[<>\s'"]/g, '');
          var params = linkParts.slice(1);
          _.each(params, function (param) {
            var paramParts = param.split("=");
            var key = paramParts[0].replace(/['" ]/g, '');
            var value = paramParts[1].replace(/['"]/g, '');
            if (key == "rel" && _.contains(relations, value)) links[value] = url;
          });
        });
      }

      return links;
    },
    parseUrl: function(url) {
      var query = [];

      var parser = document.createElement('a');
      parser.href = url;

      var queryString = parser.search.substring(1);
      _.each(queryString.split('&'), function (queryPart) {
        var queryParts = queryPart.split('=');
        query[queryParts[0]] = queryParts[1];
      });
      parser.query = query;

      return parser;
    },
    hasPrevious: function() {
        return this.hasPreviousPage();
    },
    hasNext: function() {
        return this.hasNextPage();
    }
  });

  Grid.Paginator = Backgrid.Extension.Paginator.extend({
    render: function () {
      // replaces orignal with clone that decorates ul tags
      this.$el.empty();
      var handles = this.handles;

      if (this.handles) {
        _.each(handles, function(handle, index) {
          handles[index].remove();
        });
      }

      handles = this.handles = this.makeHandles();
      var ul = document.createElement("ul");
      ul.className = 'pagination';
      _.each(handles, function(handle) {
        ul.appendChild(handle.render().el);
      });
      this.el.appendChild(ul);

      return this;
    }
  });

  Grid.View = Backbone.Marionette.ItemView.extend({
    template: function() { return ''; },
    initialize: function(options) {
      this.gridView = new Backgrid.Grid({
        columns: options.columns,
        collection: options.collection,
        className: 'table table-striped'
      });
      this.pagerView = new Grid.Paginator({
        collection: options.collection,
        className: 'grid text-center',
        controls: {
        rewind: { label: '&laquo;' },
          back: { label: '&lsaquo;' },
          forward: { label: '&rsaquo;' },
          fastForward: { label: '&raquo;' }
        }
      });
    },
    onRender: function() {
      this.gridView.render().$el.appendTo(this.$el);
      this.pagerView.render().$el.appendTo(this.$el);
    }
  });

  Grid.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'grid/:collection': 'showGrid'
    }
  });

  Grid.Controller = Marionette.Controller.extend({
    showGrid: function(grid) {
      Grid.url = grid.replace(/_/g, '/');

      $.ajax('http://graviton-060.beta.scapp.io/'+Grid.url, {
        type: 'OPTIONS',
        success: function(schema) {
          var columns = [];
          _.each(schema.items.properties, function(value, name) {
            var valueType = value.type;
            if (value.translatable) {
              valueType = 'i18n';
            }
            columns.push({
              name: name,
              cell: valueType,
              label: value.title.en,
              sortable: false,
              editable: false
            });
          });
          var collection = new Grid.Collection();
          collection.fetch();

          var view = new Grid.View({
            columns: columns,
            collection: collection
          });

          mainRegion.show(view);
        }
      });
    }
  });

  Grid.addInitializer(function() {
    new Grid.Router({
      controller: new Grid.Controller()
    });
  });

}, JST, Graviphoton.main);
