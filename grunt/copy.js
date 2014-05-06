var files = [
    'Observer.js',
    'lodashLite.js',
    'Graph.js',
    'DataSurface.js',
    'isVisible.js',
    'eleSerialize.js'
];

// Copies remaining files to places other tasks can use
module.exports = {
    dist: {
        files: [
            {
                expand: true,
                cwd: 'src/',
                dest: 'testObserver/app/lib/famous/observer/',
                flatten: true,
                src: files
            },
            {
                expand: true,
                cwd: 'src/',
                dest: 'testScroll/app/lib/famous/observer/',
                flatten: true,
                src: files
            },
            {
                expand: true,
                cwd: 'src/',
                dest: 'testEleSer/js/',
                flatten: true,
                src: files
            }
        ]
    }
};
