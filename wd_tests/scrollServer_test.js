var wd = require('wd');
var startTestScrollService = require('./util/nodeStaticServer');
var fs = require('fs');
var util = require('util');

startTestScrollService(function (serve_process) {
     console.log('opened server');
    var t = 30;
    setInterval(function(){
        console.log(--t);
    }, 1000);

    setTimeout(function () {
        serve_process.close();
        console.log('closed server')
    }, 30000);
});
