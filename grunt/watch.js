 module.exports =  {
    scripts: {
        files: ['scripts/**/*.js','test/**/*.js'],
        tasks: ['bdd'],
        options: {
            spawn: false,
            reload: true
        }
    }
};