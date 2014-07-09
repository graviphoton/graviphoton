/**
 * # Grid
 *
 * Module containg basic grid
 *
 */
Graviphoton.module('Grid', function(Grid, App, Backbone, Marionette, $, _, JST, mainRegion) {


  Backgrid.I18nFormatter = function () {};
  Backgrid.I18nFormatter.prototype = new Backgrid.CellFormatter();
  _.extend(Backgrid.I18nFormatter.prototype, {
    fromRaw: function (rawData, model) {
      // @todo use *-language headers to decide which language to use here
      return rawData.en;
    },
    toRaw: function(formattedData, model) {
      return { 'en': formattedData };
    }
  });
  Backgrid.I18nEditor = Backgrid.InputCellEditor.extend({
    initialize: function() {
      Backgrid.CellEditor.prototype.initialize.apply(this, arguments);
    }
  });
  Backgrid.I18nCell = Backgrid.Cell.extend({
    className: 'i18n-cell',
    formatter: Backgrid.I18nFormatter,
    editor: Backgrid.I18nEditor
  });

  Grid.url = '';

  Grid.Model = Backbone.Model.extend({
    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);
      this.on("change", function(model, options) {
              console.debug('saving the day', options);
              model.save();
      });
    }
  });

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

      var loadFunc = function() {
        $.ajax(Graviphoton.config.base + '/' + Grid.url, {
          type: 'OPTIONS',
          success: function(schema, textStatus, request) {
            var columns = [];
            var editableTable = (request.getResponseHeader('Access-Control-Allow-Methods').indexOf('PUT') != -1);
            _.each(schema.items.properties, function(value, name) {
              var valueType = value.type;
              var editableColumn = true;
              if (value.translatable) {
                valueType = 'i18n';
              }
              columns.push({
                name: name,
                cell: valueType,
                label: value.title.en,
                sortable: false,
                editable: editableTable && editableColumn
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
      };
      if (typeof Graviphoton.config !== 'undefined') {
        loadFunc();
      } else {
        Graviphoton.on('config:loaded', loadFunc);
      }
    }
  });

  Grid.addInitializer(function() {
    new Grid.Router({
      controller: new Grid.Controller()
    });
  });

}, JST, Graviphoton.main);
