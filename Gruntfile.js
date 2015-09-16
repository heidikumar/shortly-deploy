 module.exports = function(grunt) {

  // var commitMessage = "Testing Without Prompt";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    prompt: {
      getCommitMessage: {
        options: {
          questions: [
            {
              config: 'commitMessage',
              type: '<question type>',
              message: 'Enter commit message.',
              default: 'New commit',
            }
          ]
        }
      }
    },

    concat: {
      dist: {
        src : ['public/client/*','public/lib/*'], 
        dest: 'public/build/production.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      dist:{
        src: 'public/build/production.js', 
        dest: 'public/build/uglified.min.js'
      }
    },

    jshint: {
      files: [
        'public/client/*'
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
        // Add filespec list here
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    exec: {
      prodServer: {
        cmd: 'git add . && git commit -am \'' + grunt.config('commitMessage') +'\' && git push origin master'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-prompt');


  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////


  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [ 
    'concat', 
    'uglify'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', function(){
      /* Prompt user for commit message and store as variable */
      grunt.task.run(['jshint', 'test', 'build', 'prompt:getCommitMessage', 'exec:prodServer']);
  });
};
