'use strict';

  // var app = 'app/', assets = 'assets/';

  // // The sass task requires contructing an object. In order for that to work, we need to set some variables to hold values.
  // // An object property name doesn't seem to be able to contain variables names.
  // var sassName = 'app/assets/css/style.css', sassValue = 'app/assets/sass/*.scss';

module.exports = function(grunt) {



  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: { // Start copy task - this task copies the specified elements to the build folder
      main: { 
        files: [{ // Command to copy the files
          expand: true,
          cwd: 'app/', // Root folder to copy the files from
          src: ['*', 'assets/views/**', 'assets/images/**'], // All the folders in the app folder that need to be copied
          dest: 'build/', // The destination of the files to be copied to
          filter: 'isFile' // A filter. copies only files
        }]
      },
      htmldir: { // Name of the 2nd task in the copy task
        files: [{
          expand: true,
          cwd: 'app/', // Root folder
          src: ['*', 'assets/views/**'], //Wildcard (*) copies everything that is a file (in this case only the index.html)
          dest: 'build/', // Destination Folder
          filter: 'isFile' // A filter. copies only files
        }]
      },
      assetsdir: { // Name of the 3rd task in the copy task
        files: [{
          expand: true,
          cwd: 'app/', // Root folder
          src: [ 'assets/images/*'], // Wildcard ** copies all the files and folder from the folder assets
          dest: 'build/', // Destination Folder
          filter: 'isFile' // A filter. copies only files
        }]
      }
    },

    // The 1st task will be run by default so that it copies everything. The others will only run when there are changes in those files    

    clean: { // Start clean task - cleans out the build folder
      build: {
        src: [ 'build' ] // Destination Folder
      },
    },

    delete_sync: { // Start delete_sync task - syncs the specified build folder with the app folder 
      dist: {
        cwd: 'build/', // sync Folder 
        src: ['*', 'assets/views/**', 'assets/images/**', '!assets/sass/*.scss', '!assets//css/*.css', '!assets//js/*.js'], // Folders that are in- and excluded in the syncing
        syncWith: 'app/' // sync Folder 
      }
    },

    sass: { // Start Sass task - Converts the scss file to a css file  
      dist: {
        files: {
          'app/assets/css/style.css' : 'app/assets/sass/*.scss' // compiled file - Original file
        }
      }
    },

    cssmin: { // Start cssmin task - minifies the css file and places it in the specified folder
      target: {
        files: [{
          expand: true,
          cwd: 'app/assets/css/', // Source folder
          src: ['*.css', '!*.min.css'], // in- and excluded files
          dest: 'build/assets/css', // Destination folder
          ext: '.min.css' // Extension
        }]
      }
    },

    jshint: { // Start Jshint task - Checking of javascript for inconsistencies (vanilla JS only)
      files: ['app/assets/js/**/*.js'], // Destination Folder
      options: { 
        jshintrc: '.jshintrc', // The .jshintrc file (hidden file) is used as a check reference
        globals: {  
           
        },
        ignores : ['vendor/jquery-1.11.3.min.js'] // files that get ignored by jshint
      }
    },

    htmlhint: { // Start htmlhint task - Checks the html for inconsistencies
      build: {
        options: { // check options
          'tag-pair': true,
          'tagname-lowercase': true,
          'attr-lowercase': true,
          'attr-value-double-quotes': true,
          'doctype-first': false,
          'spec-char-escape': true,
          'id-unique': true,
          'head-script-disabled': true,
          'style-disabled': true
        },
        src: ['app/index.html', 'app/assets/views/*.html'] // Files & folders that need checking
      }
    },

    uglify: { // starts the uglify task - Minifies the specified .js files to 1 .min.js file
      build: {
        files: {
            'build/assets/js/base.min.js': ['app/assets//js/**/*.js', 'vendor/**/*.js'] // compiled file - Original file 
        }
      }
    },

  connect: { // Start connect task - starting of a localhost server
   options: {
       port: 6001, // proxy
       base: './build'// Destination folder
   },
   livereload: { // Live reload in the connect task  
       options: {
           open: {
                target: 'http://localhost:6001' // project local reference
           },
           base: [
               'build' // compiled folder project
           ]
       }
     }
  },

  watch: { // The watch task watches the specified tasks. When changes occur the watch task will run the tasks
      html: { // Live Check changes html
        files: ['app/index.html', 'app/assets/views/*.html'], 
        tasks: ['copy:htmldir', 'htmlhint'],
        options: {
          livereload: true
        }
      },

      js: { // Live Check changes JS
        files: ['app/assets/js/**/*.js'],
        tasks: ['js'],
        options: {
          livereload: true
        }
      },

      css: { // Live Check changes Css
        files: ['app/assets/sass/**/*.scss'],
        tasks: ['sass', 'cssmin'],
        options: {
          livereload: true
        }
      },

      assets: { // Live Check changes assets folder. Runs the copy task with the assetsdir task as focus 
        files: ['app/assets/**'],
        tasks: ['copy:assetsdir'],
        options: {
          livereload: true
        }
      },

      syncfolders: { // Live Check changes specified sync folder
        files: ['app/*', 'app/assets/views/*', 'app/assets/images/*'], // 
        tasks: ['delete_sync'],
        options: {
          livereload: true
        }
      },      
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-htmlhint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-delete-sync');

  // Default task(s).
  grunt.registerTask('default', ['delete_sync', 'build', 'css', 'js', 'html', 'connect', 'watch']);
  grunt.registerTask('build', ['clean', 'copy:main']);
  grunt.registerTask('js', ['jshint', 'uglify']);
  grunt.registerTask('css', ['sass', 'cssmin']);
  grunt.registerTask('html', ['htmlhint']);
};