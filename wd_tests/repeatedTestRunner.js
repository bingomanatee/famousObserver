var testPath = process.argv[2];
var delay = parseInt(process.argv[3]) || 60;
var repeats = parseInt(process.argv[4]) || 10;
var child_process = require('child_process');

// example : node repeatedTestRunner.js "my/path/to/Script.js" 120 5

console.log('path: ', testPath, 'delay: ', delay, 'repeat: ', repeats);

function loop() {
    if (repeats <= 0) {
        return console.log('done');
    } else {
        var r = repeats;
        console.log('spawning ', testPath, ' execution... ', r);
        --repeats;
        var child = child_process.spawn('node', [testPath]);
        child.stdout.on('data', function(text){
            console.log('process ', r, ': ', text.toString().substr(0, 50) + '...');
        })
        setTimeout(function(){
            child.kill();
            console.log('ending repeat', r);
            loop();
        }, delay * 1000);
    }
}

loop();