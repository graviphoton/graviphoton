module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: grunt.file.readJSON('bower.json'),
    dirs: {
      src: 'src',
      dest: 'dist',
      bower: { src: 'bower_components' }
    },
    env: {
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    concat: {
      js: { 
        options: {
          separator: ';\n',
          banner: '// <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n\n',
        },
        src: [
          '<%= dirs.bower.src %>/underscore/underscore.js',
          '<%= dirs.bower.src %>/jquery/jquery.js',
          '<%= dirs.bower.src %>/backbone/backbone.js',
          '<%= dirs.bower.src %>/backbone.marionette/lib/backbone.marionette.js',
          '<%= dirs.bower.src %>/backgrid/lib/backgrid.js',
          '<%= dirs.bower.src %>/backgrid/lib/extensions/paginator/backgrid-paginator.js',
          '<%= dirs.bower.src %>/less.js/dist/less-<%= bower.dependencies["less.js"].substr(1) %>.js',
          '<%= dirs.src %>/graviphoton.js',
          '<%= dirs.src %>/modules/**/*.js'
        ],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.js',
      },
      css: {
        src: [
          '<%= dirs.bower.src %>/bootstrap/dist/css/bootstrap.css',
          '<%= dirs.bower.src %>/bootstrap/dist/css/bootstrap-theme.css',
          '<%= dirs.bower.src %>/font-awesome/css/font-awesome.css',
          '<%= dirs.bower.src %>/backgrid/lib/backgrid.css',
          '<%= dirs.bower.src %>/backgrid/lib/extensions/paginator/backgrid-paginator.css',
          '<%= dirs.src %>/**/*.css'
        ],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.css',
      },
      less: {
        src: [
          '<%= dirs.src %>/**/*.less'
        ],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.less'
      }
    },
    copy: {
      font_awesome: {
        expand: true,
        flatten: true,
        filter: 'isFile',
        src: '<%= dirs.bower.src %>/font-awesome/font/*.*',
        dest: '<%= dirs.dest %>/font/'
      }
    },
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
    cssmin: {
      minify: {
        expand: true,
        cwd: '<%= dirs.dest %>/',
        src: ['*.css', '!*.min.css'],
        dest: '<%= dirs.dest %>/',
        ext: '.min.css'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
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
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['<%= dirs.src %>/**/*.css']
      }
    },
    preprocess: {
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
      prod: {
        files: {
          '<%= dirs.dest %>/index.html': ['index.html']
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-replacer');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.registerTask('test', ['env', 'jshint', 'csslint', 'qunit']);
  grunt.registerTask('travis', 'test');
  grunt.registerTask('dev', ['env:dev', 'preprocess:dev', 'copy:font_awesome']);
  grunt.registerTask('prod', ['env:prod', 'preprocess:prod', 'concat', 'copy', 'replacer', 'uglify', 'cssmin']);

  grunt.registerTask('default', ['test', 'dev', 'prod']);
};
