module.exports = {
    options: {
        sourceMap: true,
        preserveComments: false,
        banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n',
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
};