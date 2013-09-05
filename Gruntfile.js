module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: grunt.file.readJSON('bower.json'),
    dirs: {
      src: 'src',
      dest: 'dist',
      bower: { src: 'bower_components' }
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
            '../font/fontawesome-webfont': '../dist/font/fontawesome-webfont'
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

  grunt.registerTask('test', ['jshint', 'csslint', 'qunit']);

  grunt.registerTask('default', ['jshint', 'csslint', 'qunit', 'concat', 'copy', 'replacer', 'uglify', 'cssmin']);

};
