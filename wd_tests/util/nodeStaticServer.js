var path = require('path');
var util = require('util');
var static = require('node-static');

module.exports = function _startService(cb, testRoot, port, debug) {
    try {

    if (!port) port = 1337;
    if (debug)  console.log('test root: %s at port %s', testRoot, port);
    var fileServer = new static.Server(testRoot);

    var server = require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }).listen(port);

    cb(null, server);
} catch(err){
        cb(err);
    }
};