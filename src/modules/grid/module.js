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
  Grid.mainAction = function() {
    function actionBar(row,cell,value,columnDef,dataContext) {
      // the id is so that you can identify the row when the particular button is clicked
      return JST['grid/actionBar']({ id: dataContext.id });
    }

    var options = {
      enableCellNavigation: true,
      enableColumnReorder: false,
      forceFitColumns: true,
      autoHeight: false,
      fullWidthRows: true,
      rowHeight: 37
    };

    var functionLookups = {
      "actionBar" : actionBar,
    };

    $.getJSON("../entris.json", function(jsonData) {
       var columns = jsonData.columns;
       var data = jsonData.data;

       // map function names for action bar to real functions
       for (i = 0; i < columns.length; i++) {
         if ("formatter" in columns[i]) {
           columns[i].formatter = functionLookups[columns[i].formatter];
         }
       }

       for (i = 0; i < data.length; i++) {
          data[i].id = 'id_' + i;
       }

       var dataView = new Slick.Data.DataView({ inlineFilters: true});
       dataView.setPagingOptions({
         pageSize: 10
       });
       var grid = new Slick.Grid("#myGrid", dataView, columns, options);
       Grid.pager.show(new Grid.Pager({
         dataView: dataView
       }));
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
    });
  };

  /*
   * ## Pager
   *
   * Replacement for Slick.Controls.Pager so we can style this our own way.
   * This was implemented this way since the SlickGrid pager is not easily
   * customizable while not containing much login anyhow.
   */
  Grid.Pager = Backbone.Marionette.ItemView.extend({
    template: JST['grid/pager'],
    initialize: function() {
      var that = this;
      this.dataView = this.options.dataView || console.error('No dataView in Grid.Pager');
      this.dataView.onRowCountChanged.subscribe(function (e, args) {
        that.render();
      });
      this.dataView.onRowsChanged.subscribe(function (e, args) {
        that.render();
      });
    },
    serializeData: function() {
      return this.getNavState();
    },
    events: {
      "click .btn-pagesize": "setPageSize",
      "click .btn-first": "gotoFirst",
      "click .btn-prev": "gotoPrev",
      "click .btn-next": "gotoNext",
      "click .btn-last": "gotoLast",
    },
    setPageSize: function(event) {
      var size = parseInt(event.toElement.getAttribute('data'))
      this.dataView.setRefreshHints({
        isFilterUnchanged: true
      });
      this.dataView.setPagingOptions({pageSize: size});
    },
    gotoFirst: function() {
      if (this.getNavState().canGotoFirst) {
        this.dataView.setPagingOptions({pageNum: 0});
      }
    },
    gotoPrev: function() {
      var state = this.getNavState();
      if (state.canGotoPrev) {
        this.dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum - 1});
      }
    },
    gotoNext: function() {
      var state = this.getNavState();
      if (state.canGotoNext) {
        this.dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum + 1});
      }
    },
    gotoLast: function() {
      var state = this.getNavState();
      if (state.canGotoLast) {
        this.dataView.setPagingOptions({pageNum: state.pagingInfo.totalPages - 1});
      }
    },
    getNavState: function() {
      var cannotLeaveEditMode = !Slick.GlobalEditorLock.commitCurrentEdit();
      var pagingInfo = this.dataView.getPagingInfo();
      var lastPage = pagingInfo.totalPages - 1;

      return {
        canGotoFirst: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum > 0,
        canGotoLast: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum != lastPage,
        canGotoPrev: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum > 0,
        canGotoNext: !cannotLeaveEditMode && pagingInfo.pageSize != 0 && pagingInfo.pageNum < lastPage,
        pagingInfo: pagingInfo
      }
    },
  });

  /*
   * ## MainView
   */
  Grid.MainView = Backbone.Marionette.Layout.extend({
    template: JST['grid/main'],
    regions: {
      pager: ".grid-pager"
    }
  });

  /*
   * ## Router
   */
  Grid.Router = Marionette.AppRouter.extend({
    appRoutes: {
      'grid': 'showGrid'
    }
  });

  /*
   * ## Controller
   */
  Grid.Controller = Marionette.Controller.extend({
    showGrid: function() {
      var view = new Grid.MainView();
      Grid.pager = view.pager;
      Grid.mainAction();
      mainRegion.show(view);
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
