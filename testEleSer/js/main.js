define(function (require, exports, module) {
    console.log('running main');
    mocha.setup('bdd');

    var ele = require('test/ele');

    mocha.globals(['jQuery']);
    ele();
    mocha.run();
    console.log('mocha ran');
    mocha.checkLeaks();

    module.exports = 'main';
});