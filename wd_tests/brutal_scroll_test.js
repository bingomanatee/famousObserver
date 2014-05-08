var wd = require('wd');
var nodeStaticServer = require('./util/nodeStaticServer');
var fs = require('fs');
var util = require('util');
var path = require('path');

var testRoot = path.join(__dirname, '..', 'testBrutalScroll/app');
nodeStaticServer(function (err, server) {
    if (err) throw err;
    var browser = wd.promiseChainRemote();
    var state = browser.init({browserName: 'chrome'})
        .get('http://localhost:1338')
        .setWindowSize(800, 500)
        .then(function () {
            setTimeout(function () {
                state.elementByCss('.run-button')
                    .click()
                    .then(function () {
                        setTimeout(function () {
                            state.eval('JSON.stringify(window.$famousObserver.publish("rows"))', function (err, result) {
                                console.log('published data: %s, %s', err, result);
                                server.close();
                                state.fin(function () {
                                    if ((!err) && result) {
                                        var levelDB = require('./util/LevelModel');
                                        var db = new levelDB();
                                        db.initSub('scroll_test_2');
                                        db.saveTest('scroll', JSON.parse(result), function(err){
                                            if (err){
                                                console.log('------------ save error: ', err);
                                            }
                                            db.close();
                                            return browser.quit();
                                        });
                                    } else {
                                        return browser.quit();
                                    }
                                })
                                    .done();
                            });
                        }, 4000);
                    });
            })
        })
}, testRoot, 1338);