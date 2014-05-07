var path = require('path');
var util = require('util');
var static = require('node-static');

module.exports = function _startService(cb) {
    var testRoot = path.join(__dirname, '..', '..', 'testScroll');
    console.log('test root: %s', testRoot);
    var fileServer = new static.Server(testRoot);

    var server = require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            fileServer.serve(request, response);
        }).resume();
    }).listen(1337);

    cb(server);
};