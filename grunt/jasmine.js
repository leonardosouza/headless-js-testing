module.exports =  {
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
};