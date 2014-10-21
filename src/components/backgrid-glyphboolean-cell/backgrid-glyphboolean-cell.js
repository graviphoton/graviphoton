/*
 backgrid-datepicker-cell

 This is a simple datepicker cell based on MomentCell and
 showing the bootstrap datepicker onclick.

 Beware that this Datepicker does never show any time, just date.
 But as momentjs always works with the time, we still have to deal
 with it for the value (meaning, the resulting value from the formatter
 after toRaw()) *does* contain time again.

 We force date-only display by getting the "L" date format from momentjs.
 This should be pretty locale safe.

 I am aware that this is more complicated then just using the DateCell;
 but again, DateCell can only deal with ISO-formatted dates.

 Copyright (c) 2014 Dario Nuevo
 */
(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['underscore', 'backgrid'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(require("underscore"),
      require("backgrid"));
  } else {
    // Browser globals
    factory(root._, root.Backgrid);
  }

}(this, function (_, Backgrid) {

  // this view is our checkbox..
  var GlyphbooleanCheckbox = Backgrid.Extension.GlyphbooleanCheckbox = Backbone.View.extend({

    tagName: 'span',
    classNameUnchecked: 'glyphicon-unchecked',
    classNameChecked: 'glyphicon-check',
    column: false,
    displayValue: false,

    render: function() {

      var model = this.model;
      var column = this.column;
      var editable = Backgrid.callByNeed(column.editable(), column, model);

      var checkClass;
      if (this.displayValue == true) {
        checkClass = this.classNameChecked
      } else {
        checkClass = this.classNameUnchecked
      }

      if (this.editable) this.$el.attr('disabled', false);
      else this.$el.attr('disabled', true);

      this.$el
        .attr('tabindex', 0)
        .addClass('glyphicon')
        .addClass('clickable')
        .addClass(checkClass);

      return this;
    },

    applyToView: function(view) {
      this.render();
      view.$el.empty();
      view.$el.append(this.$el);
      view.delegateEvents();
    }

  });


  var GlyphbooleanEditor = Backgrid.Extension.GlyphbooleanEditor = Backgrid.CellEditor.extend({

    events: {
      'click': 'toggleValue',
      'keyup': 'toggleValue'
    },

    /*
    exitEditMode: function(e) {
      this.model.trigger('backgrid:edited', this.model, this.column, new Backgrid.Command(e));
    },*/

    toggleValue: function(e) {


      console.log("event " + e.which);

      // change value
      var newValue = false;
      if (this.getCurrentValue() == false) newValue = true;

      this.model.set(this.column.get("name"), newValue);

      var command = new Backgrid.Command(e);
      e.preventDefault();
      e.stopPropagation();

      this.model.trigger('backgrid:edited', this.model, this.column, command);

      return this;
    },

    /**
     Renders the datepicker on our editor
     */
    render: function () {
      var checkbox = _.extend(new Backgrid.Extension.GlyphbooleanCheckbox({
        model: this.model
      }), {column: this.column, displayValue: this.getCurrentValue()});

      checkbox.applyToView(this);

      console.log('edit! ' + this.column.id);

      this.delegateEvents();
      return this;
    },

    getCurrentValue: function() {
      return this.formatter.fromRaw(this.model.get(this.column.get('name')), this.model);
    }

  });

  var GlyphbooleanCell = Backgrid.Extension.GlyphbooleanCell = Backgrid.Cell.extend({
    editor: GlyphbooleanEditor,
    className: 'glyphboolean-cell',

    events: {
      'mouseover': 'enterEditMode'
    },

    render: function () {
      var checkbox = _.extend(new Backgrid.Extension.GlyphbooleanCheckbox({
        model: this.model
      }), {column: this.column, displayValue: this.getCurrentValue()});

      checkbox.applyToView(this);
      this.delegateEvents();

      return this;
    },

    enterEditMode: function(e) {
      GlyphbooleanCell.__super__.enterEditMode.apply(this, arguments);

      // if we come from <tab>-ing; focus..
      // it seems we can't identify <tab> as event; so all that is not mouse-based
      // leads to a focus
      if (typeof(e) == 'undefined') {
        console.log(this.$el.children('span'));
        this.$el.children('span.glyphicon').focus();
      }
    },

    getCurrentValue: function() {
      return this.formatter.fromRaw(this.model.get(this.column.get('name')), this.model);
    }

  });

}));
