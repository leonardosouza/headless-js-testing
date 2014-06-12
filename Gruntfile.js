module.exports = function(grunt) {
    // Load the plugin that provides the tasks.
    require('matchdep').filterDev('grunt-*', 'package.json').forEach(grunt.loadNpmTasks);

    // Load configs
    require('load-grunt-config')(grunt);
    
    // Default task(s)
    grunt.registerTask('bdd', ['jslint', 'jasmine', 'uglify']);
    grunt.registerTask('default', ['watch']);
};