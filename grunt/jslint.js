module.exports =  {
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
};