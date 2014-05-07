var tap = require('tap');
var TestDB = require('./util/levelDB');
var util = require('util');

tap.test('levelDB', function (suite) {

    tap.test('level db connection', function (ldc) {

        var db = new TestDB();
        var failsafe;

        db.on('db ready', function () {
            if (failsafe) {
                clearTimeout(failsafe);
                ldc.ok(true, 'db connection made');
                db.close();
                ldc.end();
            }
        });

        db.on('db error', function (error) {
            if (failsafe) {
                clearTimeout(failsafe);
                ldc.ok(false, 'db fail!!!!' + error.message);
                db.close();
                ldc.end();
            }
        });

        failsafe = setTimeout(function () {
            ldc.ok(false, 'stalling out');
            db.close();
            failsafe = false;
            ldc.end();
        }, 3000);

    });

    tap.test('leveldb get/put', function (gp) {
        var db = new TestDB();
var INPUT = {foo: 1, bar: 2};

        db.on('db ready', function () {
            clearTimeout(failsafe);

            var key = db.saveTest('foo', INPUT, function (err, key) {
                console.log('result: %s, %s', err, key);

                db.getTest(key, function(err, data){

                    console.log('fetch: %s, %s', err, util.inspect(data), key);
                    gp.deepEqual(data, INPUT, 'input saved');
                    db.close();
                    gp.end();
                })
            });
        });

        var failsafe = setTimeout(function () {
            gp.ok(false, 'stalling out');
            failsafe = false;
            db.close();
            gp.end();
        }, 3000);
    });

    suite.end();
});