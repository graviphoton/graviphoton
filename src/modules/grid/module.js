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
      if (typeof rawData === 'undefined') {
        rawData = { "en": "" };
      }
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
    className: 'i18n-cell col-md-1',
    formatter: Backgrid.I18nFormatter,
    editor: Backgrid.I18nEditor
  });
  Backgrid.I18nRequiredCell = Backgrid.I18nCell.extend({
    render: function() {
      var rendered = Backgrid.I18nCell.prototype.render.apply(this, arguments);
      var value = this.model.get(this.column.get("name"));
      if ((typeof value === 'undefined') || value.en === '') {
        rendered.$el.addClass('danger');
      } else {
        rendered.$el.removeClass('danger');
      }
      return rendered;
    }
  });

  Backgrid.StringRequiredCell = Backgrid.StringCell.extend({
    className: 'string-cell col-md-1',
    render: function() {
      var rendered = Backgrid.StringCell.prototype.render.apply(this, arguments);
      var value = this.model.get(this.column.get("name"));
      if (typeof value === 'undefined') {
        rendered.$el.addClass('danger');
      } else {
        rendered.$el.removeClass('danger');
      }
      return rendered;
    }
  });

  Backgrid.BooleanRequiredCell = Backgrid.BooleanCell.extend({
    className: 'boolean-cell col-md-1',
    // do nothing since undefined is simply false in such cases
  });

  Grid.DeleteCell = Backgrid.Cell.extend({
    className: 'delete-cell col-md-1',
    template: _.template('<a style="cursor: pointer; hand: pointer;"><i class="icon-trash"></i></a>'),
    events: {
      "click": "deleteRow"
    },
    deleteRow: function(clickEvent) {
      clickEvent.preventDefault();
      this.model.destroy();
    },
    render: function() {
      this.$el.html(this.template());
      this.delegateEvents();
      return this;
    }
  });

  Grid.url = '';

  Grid.Model = Backbone.Model.extend({
    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);
      this.isFromServer = true;
      this.on("change", function(model, options) {
        model.save();
      });
    },
    isNew: function() {
      // override isNew to allow detection that is not based on server set ids
      return !this.isFromServer;
    },
    validate: function(model, options) {
      return this.collection.columns.validate(model, options);
    }
  });

  Grid.Collection = Backbone.PageableCollection.extend({
    model: Grid.Model,
    initialize: function() {
      Backbone.PageableCollection.prototype.initialize.apply(this, arguments);
      options = arguments[1];
      this.columns = options.columns;
    },
    url: function() {
      return '/'+Grid.url;
    },
    mode: 'server',
    queryParams: {
      currentPage: 'page',
      pageSize: null
    },
    sync: function() {
      Backbone.PageableCollection.prototype.sync.apply(this, arguments);
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
      // replaces orignal with clone that decorates ul tags with the pagination class
      // also adds add new button if applicable
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

      var btnNew = document.createElement('a');
      btnNew.textContent = '+';
      var btnLi = document.createElement('li');
      btnLi.appendChild(btnNew);
      ul.appendChild(btnLi);

      $(btnNew).click(function() {
        Graviphoton.trigger('grid:new');
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
        className: 'table table-striped table-bordered'
      });
      this.pagerView = new Grid.Paginator({
        collection: options.collection,
        className: 'grid text-center',
        attributes: {
          role: 'navigation'
        },
        controls: {
          rewind: { label: '&laquo;' },
          back: { label: '&lsaquo;' },
          forward: { label: '&rsaquo;' },
          fastForward: { label: '&raquo;' }
        }
      });
      var that = this;
      Graviphoton.on('grid:new', function() {
        that.onAddRow();
      });
    },
    onRender: function() {
      this.gridView.render().$el.appendTo(this.$el);
      this.pagerView.render().$el.appendTo(this.$el);
    },
    onAddRow: function() {
      var newModel = new Grid.Model();
      _.each(this.gridView.columns.models, function(value) {
        newModel[value.attributes.name] = '';
        if (value.attributes.translatable) {
          newModel[value.attributes.name] = { 'en': '' };
        }
      });
      newModel.isFromServer = false;
      this.gridView.insertRow(newModel);
    }
  });

  Grid.Columns = Backgrid.Columns.extend({
    initialize: function(models, options) {
      Backgrid.Columns.prototype.initialize.apply(this, arguments);
      this.url = options.url || null;
    },
    sync: function() {
      var that = this;
      Backbone.$.ajax(Graviphoton.getUrl(this.url), {
        type: 'OPTIONS',
        success: function() {
          that.loadFromSchema.apply(that, arguments);
        }
      });
    },
    loadFromSchema: function(schema, textStatus, request) {
      this.editableTable = false;
      if (typeof request.getResponseHeader('Access-Control-Allow-Methods') === 'string') {
        this.editableTable = (request.getResponseHeader('Access-Control-Allow-Methods').indexOf('PUT') != -1);
      }
      this.requiredFields = schema.items.required;

      _.each(schema.items.properties, this.loadColumnFromProperty, this);

      if (this.editableTable) {
        this.push({
          cell: Grid.DeleteCell,
          editable: false
        });
      }
    },
    loadColumnFromProperty: function(property, name) {
      var type = property.type;
      if (property.translatable) {
        type = 'i18n';
      }
      if (this.requiredFields.indexOf(name) != -1) {
        cellName = type.charAt(0).toUpperCase() + type.slice(1) + 'RequiredCell';
        if (typeof Backgrid[cellName] !== 'undefined') {
          type = type + 'Required';
        } else {
          console.debug('Please define Backgrid.'+cellName);
        }
      }
      var options = {
        name: name,
        cell: type,
        label: property.title.en,
        sortable: false,
        editable: this.editableTable,
        translatable: property.translatable,
      };
      this.push(options);
    },
    validate: function(model, options)
    {
      var errors = [];
      var validateRequired = function(name) {
        if (typeof this[name] === 'undefined') {
          errors.push('require field '+name+' missing');
        }
      };
      _.each(this.requiredFields, validateRequired, model);
      if (errors.length > 0) {
        return errors;
      }
    }
  });

  Grid.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'grid/:collection': 'showGrid'
    }
  });

  Grid.Controller = Marionette.Controller.extend({
    showGrid: function(grid) {

      var loadFunc = function() {
        Grid.url = grid.replace(/_/g, '/');
        var columns = new Grid.Columns([], { url: Grid.url });
        columns.fetch();
        var collection = new Grid.Collection([], {
          url: Grid.url,
          columns: columns
        });
        collection.fetch();

        var view = new Grid.View({
          columns: columns,
          collection: collection
        });

        mainRegion.show(view);
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
