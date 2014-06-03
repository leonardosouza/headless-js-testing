module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        uglify: {
            options: {
                sourceMap: true,
                preserveComments: false,
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                compress: {
                    drop_console: true
                },
                report: 'gzip'
            },


            build: { 
                files: [{
                    "expand": true,
                    "cwd": "scripts",
                    "src": "**/*.js",
                    "dest": "build"
                }]
            }
        },

        jasmine: {
            test: {
                src: 'scripts/*.js',
                options: {
                    vendor: [
                        'scripts/vendor/jquery.js',
                        'scripts/vendor/jasmine-jquery.js',
                    ],
                    specs: 'test/*.spec.js',
                    junit: {
                        path: 'test/exports'
                    }
                }
            }
        },

        jslint: {
            test: {
                src: ['scripts/**/*.js'],
                exclude: ['scripts/vendor/**/*.js'],
                directives: {
                    bitwise: false,
                    browser: true,
                    closure: false,
                    continue: false,
                    couch: false,
                    debug: false,
                    devel: true,
                    eqeq: false,
                    evil: false,
                    forin: false,
                    newcap: false,
                    passfail: false,
                    plusplus: true,
                    regexp: true,
                    sloppy: true,
                    stupid: false,
                    unparam: false,
                    vars: false,
                    white: true,
                    predef: [
                        'jQuery'
                    ]
                },
                options: {
                    junit: 'test/exports/JSLINT-Allfiles.xml'
                }
          

            }
        },


        watch: {
          scripts: {
            files: ['scripts/**/*.js','test/**/*.js'],
            tasks: ['bdd'],
            options: {
              spawn: false,
              reload: true
            }
          },
        }
    });

    // Load the plugin that provides the tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jslint');

    // Default task(s).
    grunt.registerTask('bdd', ['jslint', 'jasmine', 'uglify']);
    grunt.registerTask('default', ['watch']);
};