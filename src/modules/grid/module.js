/**
 * # Grid
 *
 * Module containg basic grid
 *
 */
Graviphoton.module('Grid', function(Grid, App, Backbone, Marionette, $, _, JST, mainRegion) {
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

  Grid.View = Backbone.Marionette.ItemView.extend({
    template: function() { return ''; },
    initialize: function(options) {
      this.gridView = new Backgrid.Grid({
        columns: options.columns,
        collection: options.collection,
        className: 'table table-striped'
      });
      this.pagerView = new Backgrid.Extension.Paginator({
        collection: options.collection
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

      $.ajax('http://graviton.beta.scapp.io/'+Grid.url, {
        type: 'OPTIONS',
        success: function(schema) {
          var columns = [];
          _.each(schema.items.properties, function(value, name) {
            columns.push({
              name: name,
              cell: value.type,
              label: value.title,
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
