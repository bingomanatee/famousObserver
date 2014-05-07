var level = require('level');
var fs = require('fs');
var _ = require('lodash');
var LEVEL_DIR = __dirname + '/db';
var events = require('events');
var util = require('util');

try {
    fs.mkdirSync(LEVEL_DIR);
} catch (err) {
    // already exists;
}

function TestModel(dir) {
    var self = this;

    dir = dir || LEVEL_DIR;
    this.db_dir = dir;
    level(dir, {valueEncoding: 'json'}, function (err, db) {
        if (err) {
            self.error = err;
            self.emit('db error', err);
        } else {
            self.db = db;
            self.emit('db ready');
        }
    });
}
util.inherits(TestModel, events.EventEmitter);

TestModel.prototype.close = function(cb){
    if (this.db){
        this.db.close(cb);
    }
};

TestModel.prototype.saveTest = function (name, data, cb) {
    if (_.isObject(name)) {
        data = name;
        name = '';
    }
    var timestamp = new Date().getTime();
    name = name || 'test';

    var key = name + '_' + timestamp;

    this.db.put(key, data, {
        valueEncoding: 'json' // redundant precaution
    }, function(err){
        if (cb){
            cb(err, key);
        }
    });

    return key;
};

TestModel.prototype.getTest = function (testKey, cb) {
    this.db.get(testKey, cb)
};

module.exports = TestModel;