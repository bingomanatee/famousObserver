var level = require('level');
var fs = require('fs');
var _ = require('lodash');
var LEVEL_DIR = __dirname + '/db';
var events = require('events');
var util = require('util');
var async = require('async');
var Sublevel = require('level-sublevel');

function LevelModel(dir) {
    var self = this;
    this.subs = {};

    if (!dir) dir = LEVEL_DIR;
    console.log('connecting to directory ', dir);
    this.db_dir = dir;
    this.db = level(dir, {valueEncoding: 'json'});
    this.subDB = Sublevel(this.db);
    this.workingDB = this.db;
}

util.inherits(LevelModel, events.EventEmitter);

LevelModel.prototype.close = function (cb) {
    if (this.db) {
        this.db.close(cb);
    }
};

/**
 * static method -erases OBLITERATES, then, recreates a directory
 *
 * @param dir {String} a path to a directory; doesn't need to exist
 *       BUT its parent must.
 * @param cb {function} (optional)
 */

LevelModel.reset = function (dir, cb) {
    var rr = require('rimraf');
    console.log('destroying dir ', dir);
    rr(dir, function (err) {
        fs.mkdir(dir);
        if (cb) {
            cb(err)
        }
    });
};

LevelModel.prototype.initSub = function (subName) {
    if (!subName){
        this.workingDB = this.db;
        return;
    }
    if(!this.subs.hasOwnProperty(subName)){
        this.subs[subName] = this.subDB.sublevel(subName);
    }
    this.currentSub = subName;
    this.workingDB = this.subs[subName];
};

LevelModel.prototype.saveTest = function (name, data, cb) {
    if (_.isObject(name)) {
        data = name;
        name = '';
    }
    var timestamp = new Date().getTime();
    name = name || 'test';

    var key = name + '_' + timestamp;

    this.workingDB.put(key, data, {
        valueEncoding: 'json' // redundant precaution
    }, function (err) {
        if (err) {
            console.log("WRITE ERROR: ", err.message);
            //  throw err;
        } else {
            console.log('successfully wrote ', key);
        }
        if (cb) {
            cb(err, key);
        }
    });

    return key;
};

/**
 *
 * @param keyTest {various} a discriminator (regex or function) to focus on a specific set of keys; can be null for all keys
 * @param keyBatchHandler {function} recieves a key and a callback/done function.
 * @param keyBatchCount {number} optional -- concurrency -- min. 2
 * @param batchDone { function} called when the queue has no more work to do.
 * @param readDone {function} called when the last key is read from levelDB. Passed the number of keys accepted.
 */
LevelModel.prototype.keys = function (keyTest, keyBatchHandler, keyBatchCount, batchDone, readDone) {

    if (!_.isFunction(keyBatchHandler)) {
        throw new Error('second argument must be function');
    }

    keyBatchCount = Math.max(2, keyBatchCount);
    if (!_.isFunction(batchDone)) {
        batchDone = _.identity;
    }

    var q = async.queue(keyBatchHandler, keyBatchCount);
    q.drain = batchDone;

    var keyCount = 0;
    this.workingDB.createKeyStream()
        .on('data', function (key) {
            key = key.toString();

            if (_.isFunction(keyTest)) {
                if (keyTest(key)) {
                    ++keyCount;
                    q.push(key);
                } else {
                    console.log('rejecting key ', key);
                }
            } else if (_.isRegExp(keyTest)) {
                if (keyTest.test(key)) {
                    ++keyCount;
                    q.push(key);
                } else {
                    console.log('rejecting key ', key);
                }
            } else {
                ++keyCount;
                q.push(key);
            }
        }).on('end', function () {
            if (readDone) {
                readDone(keyCount);
            }
        });

};

LevelModel.prototype.getTest = function (testKey, cb) {
    this.workingDB.get(testKey, cb)
};

module.exports = LevelModel;