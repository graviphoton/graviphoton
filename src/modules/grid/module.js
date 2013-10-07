/*
 * # Grid
 *
 * Module containing basic grid components.
 *
 */
Graviphoton.module('Grid', function(Grid, App, Backbone, Marionette, $, _, JST, mainRegion, Slick) {

  /*
   * ## mainAction
   *
   */
  Grid.mainAction = function(gridCollection) {
    gridCollection.fetch({
      success: function(result) {
        var jsonData = result.toJSON()[0];
        var columns = jsonData.columns;
        var data = jsonData.data;

        var dataView = new Slick.Data.DataView({ inlineFilters: true});
        dataView.setPagingOptions({
          pageSize: 10
        });
        var grid = new Slick.Grid("#myGrid", dataView, columns, options);
        Grid.pagerView = new Grid.Pager({
          dataView: dataView
        });
        Grid.pager.show(Grid.pagerView);
        grid.setSelectionModel(new Slick.RowSelectionModel());
        grid.autosizeColumns();
 
        // custom filter function
        function columnFilter(item, args) {
          // check title column
          if (args.searchString !== "" && item.KUNDEN_BEZEICHNUNG.toLowerCase().indexOf(args.searchString.toLowerCase()) == -1) {
            return false;
          }
          return true;
        }

        // handler when user presses a key in search text box
        $("#searchTextBox").keyup(function (e) {
          Slick.GlobalEditorLock.cancelCurrentEdit();

          // clear on Esc
          if (e.which == 27) {
            this.value = "";
          }

          dataView.setFilterArgs({
            searchString: this.value
          });
          dataView.refresh();
        });

        // our native compare functions for column KUNDEN_BEZEICHNUNG
        function comparer(a, b) {
          var x = a[sortcol], y = b[sortcol];
          return (x == y ? 0 : (x > y ? 1 : -1));
        }

        // sort event when clicking with mouse on a column title
        grid.onSort.subscribe(function (e, args) {
          sortcol = args.sortCol.field;

          // can be very slow in IE with huge datasets
          dataView.sort(comparer, args.sortAsc);
        });

        // dataView.setItems() fires onRowCountChanged event to display the rows
        dataView.onRowCountChanged.subscribe(function (e, args) {
          grid.updateRowCount();
          grid.render();
        });

        // display new rows when paging
        dataView.onRowsChanged.subscribe(function (e, args) {
          grid.invalidateRows(args.rows);
          grid.render();
        });

        dataView.beginUpdate();
        dataView.setItems(data);
        dataView.setFilterArgs({
          searchString: ""
        });

        // set row filter when entering a search key into search text box.
        dataView.setFilter(columnFilter);

        dataView.endUpdate();
        dataView.syncGridSelection(grid, true);
      },
      error: console.error
    });
  };

  /*
   * ## Model
   *
   * Model for describing the grid to be show.
   */
  Grid.Model = Backbone.Model.extend({
    url: '../model.json',
    getColumns: function() {
      columns = this.toJSON().columns;
      var formatterFunction = function(row,cell,value,columnDef,dataContext) {
        return template(dataContext);
      };
 
      // map function names for action bar to real functions
      for (i = 0; i < columns.length; i++) {
        if ("formatter" in columns[i]) {
	  // use available JST template as formatter
          var template = JST[columns[i].formatter];

          columns[i].formatter = formatterFunction;
	}
      }
      return columns;
    }
  });

  Grid.RowModel = Backbone.Model.extend({
  });

  /*
   * ## Collection
   *
   * Backbone.Collection for accessing the grid data.
   */
  Grid.Collection = Backbone.Paginator.requestPager.extend({
    model: Grid.RowModel,
    paginator_core: {
      dataType: 'json',
      url: '../data.json'
    },
    paginator_ui: {
      firstPage: 0,
    },
    initialize: function() {
      this.pager();
    },
    getLength: function() {
      return this.length;
    },
    getItem: function(pos) {
      return this.at(pos).toJSON();
    }
  });

  /*
   * ## Pager
   *
   * Replacement for Slick.Controls.Pager so we can style this our own way.
   * This was implemented this way since the SlickGrid pager is not easily
   * customizable while not containing much login anyhow.
   */
  Grid.Pager = Backbone.Marionette.ItemView.extend({
    template: JST['grid/pager'],
    /*
     * ### initialize
     *
     * check options and subscribe to events.
     */
    initialize: function() {
      var that = this;
      this.dataView = this.options.collection || console.error('No collection in Grid.Pager');
      this.collection.on("change", this.render);
      this.collection.on("add", function() {
        that.render();
      });
      this.collection.on("remove", this.render);
    },
    /*
     * ### serializeData
     *
     * return data for template
     */
    serializeData: function() {
      return this.getNavState();
    },
    /*
     * ### events
     *
     * setup event handlers
     */
    events: {
      "click .btn-pagesize": "setPageSize",
      "click .btn-first": "gotoFirst",
      "click .btn-prev": "gotoPrev",
      "click .btn-next": "gotoNext",
      "click .btn-last": "gotoLast",
    },
    /*
     * ### setPageSize
     *
     * Set a new page size
     */
    setPageSize: function(event) {
      var size = parseInt(event.toElement.getAttribute('data'), 10);
      this.dataView.setRefreshHints({
        isFilterUnchanged: true
      });
      this.dataView.setPagingOptions({pageSize: size});
    },
    /*
     * ### gotoFirst
     *
     * Go to first page.
     */
    gotoFirst: function() {
      if (this.getNavState().canGotoFirst) {
        this.dataView.setPagingOptions({pageNum: 1});
      }
    },
    /*
     * ### gotoPrev
     *
     * Go to previous page.
     */
    gotoPrev: function() {
      var state = this.getNavState();
      if (state.canGotoPrev) {
        this.dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum - 1});
      }
    },
    /*
     * ### gotoNext
     *
     * Go to next page.
     */
    gotoNext: function() {
      var state = this.getNavState();
      if (state.canGotoNext) {
        this.dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum + 1});
      }
    },
    /*
     * ### gotoLast
     *
     * Go to last page.
     */
    gotoLast: function() {
      var state = this.getNavState();
      if (state.canGotoLast) {
        this.dataView.setPagingOptions({pageNum: state.pagingInfo.totalPages - 1});
      }
    },
    /*
     * ### gotoN
     *
     * Go to specific page.
     */
    gotoN: function(n) {
      if (n > 0 && this.getNavState().pagingInfo.totalPages <= n) {
        this.dataView.setPagingOptions({pageNum: n - 1});
      }
    },
    getNavState: function() {
      var cannotLeaveEditMode = !Slick.GlobalEditorLock.commitCurrentEdit();
      var pagingInfo = this.dataView.info();
      var lastPage = pagingInfo.totalPages - 1;

      return {
        canGotoFirst: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum > 0,
        canGotoLast: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum !== lastPage,
        canGotoPrev: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum > 0,
        canGotoNext: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum < lastPage,
        pagingInfo: pagingInfo
      };
    },
  });

  /*
   * ## MainView
   */
  Grid.MainView = Backbone.Marionette.Layout.extend({
    template: JST['grid/main'],
    className: 'panel panel-default',
    regions: {
      pager: ".grid-pager",
      body: ".panel-body",
    }
  });

  /*
   * ## Router
   */
  Grid.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'grid': 'showGrid',
      'grid/p=:page': 'showGridOnPage'
    }
  });

  /*
   * ## Controller
   */
  Grid.Controller = Marionette.Controller.extend({
    showGrid: function() {
      // backbone model and collection made compatible with slickgrid
      var model = new Grid.Model(),
          collection = new Grid.Collection();

      // fetch model structure (stuff like columns, title, etc)
      model.fetch({
        success: function(data) {
          // prepare view for slickgrid to fill
          var view = new Grid.MainView({
            model: data
          });
          mainRegion.show(view);

          // create slick grid instance
          var grid = new Slick.Grid(
            $('.grid'),
            collection,
            data.getColumns(),
            {
              enableCellNavigation: true,
              enableColumnReorder: false,
              forceFitColumns: true,
              autoHeight: false,
              fullWidthRows: true,
              rowHeight: 37
            }
          );
          grid.setSelectionModel(new Slick.RowSelectionModel());
          grid.autosizeColumns();

          // setup pager
          var pager = new Grid.Pager({
            collection: collection
          });
          view.pager.show(pager);

          // fetch actual grid data
          collection.fetch({
            success: function(data) {
              grid.render();
              pager.render();
            },
            error: function() {
              console.log("Error fetching grid data");
            }
          });

        },
        error: function() {
          console.log("Error fetching grid metadata");
        }
      });
    },
    showGridOnPage: function(page) {
      if (!Grid.pager) {
        this.showGrid();
      }
      Grid.pagerView.gotoN();
    }
  });

  /*
   * ## Initializer
   *
   * fire up a router/controller combo
   */
  Grid.addInitializer(function() {
    new Grid.Router({
      controller: new Grid.Controller()
    });
  });

}, JST, Graviphoton.main, Slick);
