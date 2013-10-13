/*
 * # Gruntfile
 *
 * The Gruntfile configures grunt tasks that are available by executing grunt.
 *
 * Grunt is used for building a working graviphoton during development as well
 * as during the build phase and this file task care of getting all the needed
 * tasks up and running.
 *
 * Depending on your installation you might have to substitute the ```grunt```
 * call with the grunt in ```node_modules/grunt-cli/bin/grunt```.
 */
module.exports = function(grunt) {
  // ## Setup Tasks
  grunt.initConfig({
    /*
     * ### Includes
     *
     * npm and bower module information is available under pkg
     * and bower later in this initConfig directive.
     */
    pkg: grunt.file.readJSON('package.json'),
    bowerJson: grunt.file.readJSON('bower.json'),
    /*
     * ### Dirs
     *
     * We also need to know where to read files from and where
     * to store them.
     */
    dirs: {
      src: 'src',
      dest: 'dist',
      bower: { src: 'bower_components' }
    },
    /*
     * ### Env
     *
     * Graviphoton defines different envs during the build stage.
     */
    env: {
      /*
       * #### development
       *
       * The development env creates human readable deliverables suitable to
       * hacking.
       */
      dev: {
        NODE_ENV: 'development'
      },
      /*
       * #### production
       *
       * The production env creates concated and minified content
       */
      prod: {
        NODE_ENV: 'production'
      }
    },
    /*
     * ### Bower
     *
     * Use bower to install prebuilt libs.
     */
    bower: {
      install: {
        copy: false
      }
    },
    /*
     * ### JST
     *
     * We rely on precompiled JST templates in all envs. Devs might want to
     * configure their IDE so it executes ```grunt jst``` on all changes to
     * .tpl files automagically.
     *
     * Templates map to dirs like so:
     * - src/modules/<module>/<name>.tpl => <module>/<name>
     *
     */
    jst: {
      templates: {
        options: {
          processName: function(name) {
            // grab src dir location
            srcPart = grunt.template.process('<%= dirs.src %>');
            // remove modules part from tpl
            srcPart += '/modules/';
            // remove srcPath and ext from name
            return name.substring(srcPart.length).slice(0, -4);
          }
        },
        files: {
          '<%= dirs.dest %>/templates.js': [ '<%= dirs.src %>/modules/**/*.tpl' ]
        }
      }
    },
    /**
     * ### Concat
     *
     * In the concat phase js, css and other files are combined into an unminified
     * whole. The following formats get concated. Keep in mind that this is the
     * place you will add new files from modules to the dist files.
     */
    concat: {
      // * js
      js: {
        options: {
          separator: ';\n',
          banner: '// <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n\n',
        },
        src: [
          '<%= dirs.bower.src %>/underscore/underscore.js',
          '<%= dirs.bower.src %>/jquery/jquery.js',
          '<%= dirs.bower.src %>/jquery.event/event.drag/jquery.event.drag.js',
          '<%= dirs.bower.src %>/backbone/backbone.js',
          '<%= dirs.bower.src %>/backbone.marionette/lib/backbone.marionette.js',
          '<%= dirs.bower.src %>/backbone.bootstrap-modal/src/backbone.bootstrap-modal.js',
          '<%= dirs.bower.src %>/backgrid/lib/backgrid.js',
          '<%= dirs.bower.src %>/backgrid/lib/extensions/paginator/backgrid-paginator.js',
          '<%= dirs.bower.src %>/less.js/dist/less-<%= bowerJson.dependencies["less.js"].substr(1) %>.js',
          '<%= dirs.bower.src %>/bootstrap/dist/js/bootstrap.js',
          '<%= dirs.bower.src %>/slickgrid/slick.*.js',
          '<%= dirs.bower.src %>/slickgrid/controls/slick.*.js',
          '<%= dirs.bower.src %>/slickgrid/plugins/slick.*.js',
          '<%= dirs.dest %>/templates.js',
          '<%= dirs.src %>/graviphoton.js',
          '<%= dirs.src %>/modules/**/*.js'
        ],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.js',
      },
      // * css
      css: {
        src: [
          '<%= dirs.bower.src %>/bootstrap/dist/css/bootstrap.css',
          '<%= dirs.bower.src %>/bootstrap/dist/css/bootstrap-theme.css',
          '<%= dirs.bower.src %>/font-awesome/css/font-awesome.css',
          '<%= dirs.bower.src %>/backgrid/lib/backgrid.css',
          '<%= dirs.bower.src %>/backgrid/lib/extensions/paginator/backgrid-paginator.css',
          '<%= dirs.bower.src %>/slickgrid/slick.grid.css',
          '<%= dirs.bower.src %>/slickgrid/controls/slick.pager.css',
          '<%= dirs.bower.src %>/slickgrid/controls/slick.columnpicker.css',
          '<%= dirs.src %>/**/*.css'
        ],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.css',
      },
      // * less
      less: {
        src: [
          '<%= dirs.src %>/**/*.less'
        ],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.less'
      }
    },
    /*
     * ### Copy
     *
     * Some source files only need copying.
     */
    copy: {
      font_awesome: {
        expand: true,
        flatten: true,
        filter: 'isFile',
        src: '<%= dirs.bower.src %>/font-awesome/font/*.*',
        dest: '<%= dirs.dest %>/font/'
      }
    },
    /*
     * ### Replacer
     *
     * Some of the css we concated earlier needs fixing.
     */
    replacer: {
      font_awesome_path: {
        options: {
          replace: {
            '../font/fontawesome-webfont': 'font/fontawesome-webfont'
          }
        },
        files: [
          {
            src: '<%= dirs.dest %>/graviphoton.css',
            dest: '<%= dirs.dest %>/graviphoton.css'
          }
        ]
      }
    },
    /*
     * ### Uglify
     *
     * Uglifying make the memeory footprint shrink alot.
     */
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%= dirs.dest %>/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },
    /*
     * ### CSSmin
     *
     * We can also save some space by shaving of some bytes of css.
     */
    cssmin: {
      minify: {
        expand: true,
        cwd: '<%= dirs.dest %>/',
        src: ['*.css', '!*.min.css'],
        dest: '<%= dirs.dest %>/',
        ext: '.min.css'
      }
    },
    /*
     * ### QUnit
     *
     * setup and run qunit tests
     */
    qunit: {
      files: ['test/**/*.html']
    },
    /*
     * ### JShint
     *
     * catches obvious js coding errors.
     */
    jshint: {
      files: ['gruntfile.js', '<%= dirs.src %>/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    /*
     * ### CSSlint
     *
     * css needs linting so the minifier works out!
     */
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['<%= dirs.src %>/**/*.css']
      }
    },
    /*
     * ### PreProcess
     *
     * The preprocessor parses html files with special markup to create
     * deliverable html files.
     */
    preprocess: {
      /*
       * #### development
       *
       * In dev mode the preprocessor creates a very verbose file in
       * dist/dev.html. This files contains regular script includes
       * to css, less and js files. This way you can hack on those
       * scripts and only need to run ```grunt dev``` when adding new
       * files in src/ or bower_modules/.
       */
      dev: {
        files: {
          '<%= dirs.dest %>/dev.html': ['index.html']
        },
        options: {
          context: {
            BOWER_DIR: '../<%= dirs.bower.src %>',
            CSS_INCLUDES: '<% var css_files = [];'+
                          'grunt.util.recurse(concat.css.src, function(a) { css_files.push(grunt.file.expand(grunt.template.process(a))); }); '+
                          'grunt.util.recurse(css_files, function (a) { %><link rel="stylesheet" type="text/css" href="../<%= a %>" />\n    <% }); %>',
            LESS_INCLUDES: '<% var less_files = [];'+
                           'grunt.util.recurse(concat.less.src, function(a) { less_files.push(grunt.file.expand(grunt.template.process(a))); }); '+
                           'grunt.util.recurse(less_files, function (a) { %><link rel="stylesheet/less" type="text/css" href="../<%= a %>" />\n    <% }); %>',
            JS_INCLUDES: '<% var js_files = []; '+
                         'grunt.util.recurse(concat.js.src, function(a) { js_files.push(grunt.file.expand(grunt.template.process(a))); }); '+
                         'grunt.util.recurse(js_files, function (a) { %><script type="text/javascript" src="../<%= a %>"></script>\n    <% }); %>'
          }
        }
      },
      /*
       * #### production
       *
       * In production the index file that gets created loads only uglified code.
       */
      prod: {
        files: {
          '<%= dirs.dest %>/index.html': ['index.html']
        }
      }
    },
    /*
     * ### Watch
     *
     * Watches trigger tasks on file changes.
     */
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  /*
   * ## External Tasks
   *
   * These external tasks where installed with ```npm install```.
   *
   * - uglify: makes js unreadable and small
   */
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // - jshint: linter for js files
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // - qunit: testing framework
  grunt.loadNpmTasks('grunt-contrib-qunit');
  // - watch: trigger tasks on file changes
  grunt.loadNpmTasks('grunt-contrib-watch');
  // - concat: combine files
  grunt.loadNpmTasks('grunt-contrib-concat');
  // - csslint: syntax checker for css files
  grunt.loadNpmTasks('grunt-contrib-csslint');
  // - cssmin: make css files smaller
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // - replacer: replace contents in files
  grunt.loadNpmTasks('grunt-replacer');
  // - copy: copy files
  grunt.loadNpmTasks('grunt-contrib-copy');
  // - env: set/use envs
  grunt.loadNpmTasks('grunt-env');
  // - preprocess: rudimentary html preprocessor (think m4, but less features;))
  grunt.loadNpmTasks('grunt-preprocess');
  // - jst: javascript template compiler
  grunt.loadNpmTasks('grunt-contrib-jst');
  // - bower: bower package manager
  grunt.loadNpmTasks('grunt-bower-task');

  /*
   * ## Tasks
   * ### test
   *
   * Runs the testsuites.
   */
  grunt.registerTask('test', ['bower', 'env', 'jshint', 'csslint', 'prod', 'qunit']);
  /*
   * ### travis
   *
   * Hook for http://travis-ci.org
   */
  grunt.registerTask('travis', 'test');
  /*
   * ### dev
   *
   * Create development artefacts like dist/dev.html.
   */
  grunt.registerTask('dev', ['bower', 'env:dev', 'jst', 'preprocess:dev', 'copy:font_awesome']);
  /*
   * ### prod
   *
   * Create production artefacts like dist/index.html.
   */
  grunt.registerTask('prod', ['bower', 'env:prod', 'jst', 'preprocess:prod', 'concat', 'copy', 'replacer', 'uglify', 'cssmin']);
  /*
   * ### default
   *
   * Run all the things if noone specifed.
   */
  grunt.registerTask('default', ['test', 'dev', 'prod']);
};
