var wd = require('wd');
var startTestScrollService = require('./util/startTestScrollService');
var fs = require('fs');
var util = require('util');

startTestScrollService(function (serve_process) {

    var browser = wd.promiseChainRemote();
    var state = browser.init({browserName: 'chrome'})
        .get('http://localhost:1337')
        .setWindowSize(800, 500)
        .then(function () {
            setTimeout(function () {
                state.elementByCss('.run-button')
                    .click()
                    .then(function () {
                        setTimeout(function () {
                            state.eval('JSON.stringify(window.$famousObserver.publish("rows"))', function (err, result) {
                                console.log('published data: %s, %s', err, result);
                                serve_process.close();
                                if (1 && !err) {
                                    state.fin(function () {
                                        return browser.quit();
                                    })
                                        .done();
                                }
                            });
                        }, 4000);
                    });
            })
        })
});