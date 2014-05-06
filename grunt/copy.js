// Copies remaining files to places other tasks can use
module.exports = {
    dist: {
        files: [
            {
                expand: true,
                cwd: 'src/',
                dest: 'testObserver/app/lib/famous/observer/',
                flatten: true,
                src: [
                    'Observer.js',
                    'lodashLite.js',
                    'Graph.js',
                    'DataSurface.js'
                ]
            },
            {
                expand: true,
                cwd: 'src/',
                dest: 'testScroll/app/lib/famous/observer/',
                flatten: true,
                src: [
                    'Observer.js',
                    'lodashLite.js',
                    'Graph.js',
                    'DataSurface.js'
                ]
            }
        ]
    }
};
