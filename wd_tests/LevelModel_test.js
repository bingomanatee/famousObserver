var tap = require('tap');
var LevelModel = require('./util/LevelModel');
var util = require('util');
var _ = require('lodash');

tap.test('LevelModel', function (suite) {

    tap.test('connection', function (ldc) {
        var db;
        var failsafe = setTimeout(function () {
            ldc.ok(false, 'stalling out');
            if (db) db.close();
            failsafe = false;
            ldc.end();
        }, 3000);
        var testDB1 = __dirname + '/testdb1';
        LevelModel.reset(testDB1, function () {

            try {
                db = new LevelModel(testDB1);
                ldc.ok(true, 'database connection made');
            } catch (err) {
                ldc.ok(false, err.message);
            }
            ldc.end();
        });

    });

    tap.test('get/put', function (gp) {
        var INPUT = {foo: 1, bar: 2};
        var db2 = __dirname + '/db2';
        var db;
        var failsafe = setTimeout(function () {
            gp.ok(false, 'stalling out');
            failsafe = false;
            db.close();
            gp.end();
        }, 3000);

        LevelModel.reset(db2, function () {
            db = new LevelModel(db2);
            clearTimeout(failsafe);
            db.saveTest('foo', INPUT, function (err, key) {
                console.log('result: %s, %s', err, key);

                db.getTest(key, function (err, data) {

                    console.log('fetch: %s, %s', err, util.inspect(data), key);
                    gp.deepEqual(data, INPUT, 'input saved');
                    db.close();
                    LevelModel.reset(db2);
                    gp.end();
                })
            });

        });
    });

    tap.test('subs', function (s) {

        var sDir = __dirname + '/subsDir';

        LevelModel.reset(sDir, function () {  // in case previous tests did stuff
            var db = new LevelModel(sDir);

            db.saveTest('test_one', {name: 'test_one', sub: ''}, function () {
                var keys = [];
                db.keys(true, function (key) {
                    keys.push(key);
                }, 5, function () {

                }, function () {
                    console.log('base keys: %s', keys);
                    s.ok(keys.length == 1, 'one key found');
                    s.ok(/^test_one_[\d]+/.test(keys[0]), 'key has expected name');

                    db.initSub('foo');

                    db.saveTest('test_two', {name: 'test_two', sub: 'foo'}, function () {
                            var skeys = [];

                            db.keys(true, function (key) {
                                skeys.push(key);
                            }, 5, function () {

                            }, function () {
                                console.log('skeys: %s', skeys);
                                s.equal(skeys.length, 1, 'one skeys found');
                                s.ok(/^test_two_[\d]+/.test(skeys[0]), 'found test two');

                                db.initSub('');

                                var allkeys = [];

                                db.keys(true, function (key) {
                                    allkeys.push(key);
                                }, 5, function () {

                                }, function () {
                                    console.log('all keys: %s', allkeys);
                                    var found_test_two = _.find(allkeys, function (k) {
                                        return /foo.*test_two_[\d]+/.test(k);
                                    });
                                    var found_test_one = _.find(allkeys, function (k) {
                                        return /^test_one_[\d]+/.test(k);
                                    });
                                    s.ok(found_test_one, 'found key test one in all keys');
                                    s.ok(found_test_two, 'found key test two in all keys');
                                    LevelModel.reset(sDir);
                                    s.end();
                                });

                            });
                        }
                    )
                });
            });
        });
    });

    suite.end();
});