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
                    specs: 'test/*.spec.js'
                }
            }
        }
    });

    // Load the plugin that provides the tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['jasmine','uglify']);
};