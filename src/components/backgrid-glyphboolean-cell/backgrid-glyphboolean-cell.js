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

      //console.log(this.model);
      //console.log(this.column);
      //console.log('--------------');


      var model = this.model;
      var column = this.column;
      var editable = Backgrid.callByNeed(column.editable(), column, model);

      var checkClass;
      if (this.displayValue == true) {
        checkClass = this.classNameChecked
      } else {
        checkClass = this.classNameUnchecked
      }

      this.$el
        .addClass('glyphicon')
        .addClass('clickable')
        .addClass(checkClass);
      /*
      var checkbox = $('<div>', {
        disabled: !editable
      })

      this.$el.append(checkbox);
      */

      return this;

    },

    applyToView: function(view) {

      this.render();

      view.$el.empty();
      view.$el.append(this.$el);

      view.delegateEvents();
    }

  });

  /**
   Renders an input box with a datepicker for date selection.

   @class Backgrid.Extension.DatePickerEditor
   @extends Backgrid.InputCellEditor
   */

  var GlyphbooleanEditor = Backgrid.Extension.GlyphbooleanEditor = Backgrid.CellEditor.extend({

    //tagName: 'span',

    events: {
      'click': 'toggleValue'
    },

    exitEditMode: function(e) {
      this.model.trigger('backgrid:edited', this.model, this.column, new Backgrid.Command(e));
    },

    toggleValue: function(e) {

      // events
      //this.model.trigger('backgrid:edit', this.model, this.column, this, this.currentEditor);
      //this.model.trigger('backgrid:editing', this.model, this.column, this, this.currentEditor);

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
      this.$el.children('span.glyphicon').focus();

      //this.$el.append($('<span>dud</span>'));


      /*
      var checkbox = _.extend(new Backgrid.Extension.GlyphbooleanCheckbox({
        model: this.model
      }), {column: this.column, displayValue: this.getCurrentValue()});

      this.$el.empty();
      this.$el.append(checkbox.render().$el);

      this.delegateEvents();

      console.log(this.column);
      */

      console.log('edit! ' + this.column.id);

      this.delegateEvents();

      //this.model.trigger("backgrid:edited", this.model, this.column, new Backgrid.Command({}));

      //this.$el = this.prevEl;
      //console.log(this.$el.data('checkedClass'));

      /*
      this.$el.append($('<span>', {
        type: "checkbox",
        checked: this.formatter.fromRaw(model.get(column.get("name")), model),
        disabled: !editable
      }));
      */
      return this;
    },

    getCurrentValue: function() {
      return this.formatter.fromRaw(this.model.get(this.column.get('name')), this.model);
    }

  });

  var GlyphbooleanCell = Backgrid.Extension.GlyphbooleanCell = Backgrid.Cell.extend({
    editor: GlyphbooleanEditor,
    className: 'glyphboolean-cell',

    /** @property */
      /*
    events: {
      "click": "toggleValue",
      "focus": "toggleValue",
      "keydown": "toggleValue"
    },
    */

    events: {
      'mouseover': 'enterEditMode'
      //'mouseleave': 'exitEditMode'
    },

    render: function () {

      console.log('back to basic');

      var checkbox = _.extend(new Backgrid.Extension.GlyphbooleanCheckbox({
        model: this.model
      }), {column: this.column, displayValue: this.getCurrentValue()});

      checkbox.applyToView(this);

      this.delegateEvents();

      return this;
    },

    getCurrentValue: function() {
      return this.formatter.fromRaw(this.model.get(this.column.get('name')), this.model);
    }

  });

}));
