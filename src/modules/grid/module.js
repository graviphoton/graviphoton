/*
 * # Grid
 *
 * Module containing basic grid components.
 *
 */
Graviphoton.module('Grid', function(Grid, App, Backbone, Marionette, $, _, JST, mainRegion) {

  /*
   * ## mainAction
   *
   */
  Grid.mainAction = function() {
    function actionBar(row,cell,value,columnDef,dataContext) {
      // the id is so that you can identify the row when the particular button is clicked
      var button = "<input type='button' value='Button' id='" + dataContext.id + '0' + "'>";
      var checkbox = "<input type='checkbox' value='Checkbox' id='" + dataContext.id + '1' + "'>"
      var html = "<a href='http://www.swisscom.ch' id='" + dataContext.id + '2' + "'>" + "swisscom</a>";

      return button + checkbox + html;
    }

    var options = {
      enableCellNavigation: true,
       enableColumnReorder: false,
      forceFitColumns: false,
      topPanelHeight: 30
    };

    var functionLookups = {
      "actionBar" : actionBar,
    }

    $.getJSON("../entris.json", function(data) {
       var columns = data['columns'];
       var data = data['data'];

       // map function names for action bar to real functions
       for (i = 0; i < columns.length; i++) {
         if ("formatter" in columns[i]) {
           columns[i]['formatter'] = functionLookups[columns[i]['formatter']];
         }
       }

       for (i = 0; i < data.length; i++) {
          data[i]['id'] = 'id_' + i;
       }

       var dataView = new Slick.Data.DataView({ inlineFilters: true });
       var grid = new Slick.Grid("#myGrid", dataView, columns, options);
       var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
       grid.setSelectionModel(new Slick.RowSelectionModel());
       grid.autosizeColumns();
 
       // custom filter function
       function columnFilter(item, args) {
         // check title column
         if (args.searchString != "" && item["KUNDEN_BEZEICHNUNG"].toLowerCase().indexOf(args.searchString.toLowerCase()) == -1) {
           return false;
         }
         return true;
       }

       // show pager setting in the right down corner of the grid
       $(".slick-pager-settings-expanded").show()

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

       dataView.beginUpdate()
       dataView.setItems(data);
       dataView.setFilterArgs({
         searchString: ""
       });

       // set row filter when entering a search key into search text box.
       dataView.setFilter(columnFilter);

       dataView.endUpdate()
       dataView.syncGridSelection(grid, true);
    });
  };

  /*
   * ## MainView
   */
  Grid.MainView = Backbone.Marionette.ItemView.extend({
    template: JST['grid/main'],
  });

  /*
   * ## Initializer
   */
  Grid.addInitializer(function() {
    mainRegion.show(new Grid.MainView());
    Grid.mainAction();
  });


}, JST, Graviphoton.main);
