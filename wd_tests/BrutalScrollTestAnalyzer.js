var LevelDB = require('./util/LevelModel');

var db = new LevelDB();
var keyCount = 0;
var keysProcessed = 0;
var _ = require('lodash');
var keys = [];
var util = require('util');
var Series = require('./util/scroll_test/Series');
var fs = require('fs');

try {
    fs.mkdirSync(__dirname + '/scroll_test_2_output');
} catch (err) {
}

db.initSub('scroll_test_2');

function tryEnd() {
    if (keyCount && (keyCount == keysProcessed)) {
        console.log('... END of read');

        readTests();
    }
}

function readTests() {
    var testsAnalyzed = 0;

    var agg = [];
    _.each(keys, function (key) {
        db.getTest(key, function (err, record) {
            console.log(" -------- TEST RUN %s ------------", key);

            var series = new Series(record, key);
            fs.writeFileSync(__dirname + '/scroll_test_2_output/' + key + '.js', "var data = " + (series.d3Data(true, true, 4)));
            fs.writeFileSync(__dirname + '/scroll_test_2_output/' + key + '_flat.js', "var data = " + (series.d3DataFlat(true, true, 4)));

            agg.push(series.summary());
            ++testsAnalyzed;
            if (testsAnalyzed == keys.length) {
                fs.writeFileSync(__dirname + '/scroll_test_2_output/agg.js', 'var agg = ' + JSON.stringify(agg, true, 4));
                db.close();
                console.log('... DONE!');
            }
        })
    });

}

db.keys(/^scroll/, function (key, cb) {
    console.log('found key %s', key);
    keys.push(key);
    ++keysProcessed;
    cb();
}, 5, function () {
    console.log('done with batch');
    tryEnd();
}, function (k) {
    console.log('done loading');
    keyCount = k;
    tryEnd();
});