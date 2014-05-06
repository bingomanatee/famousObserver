/*globals define*/
define(function (require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/observer/DataSurface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollContainer = require('famous/views/ScrollContainer');
    var ScrollView = require('famous/views/ScrollView');
    var Transform = require('famous/core/Transform');
    var color_list = require('color_list');
    var _ = require('famous/observer/lodashLite');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var observer = require('famous/observer/Observer');
    var Graph = require('famous/observer/Graph');

    // create the main context
    var mainContext = Engine.createContext();

    function graph(data) {
        console.log(data);

        var rows = {};

        _.each(data, function (datum) {
            var time = datum.time;

            _.each(datum.result, function (res) {
                var info = {time: time, height: res.height, color: _color(res.height)};

                if (rows.hasOwnProperty(res.row)) {
                    rows[res.row].push(info);
                } else {
                    rows[res.row] = [info];
                }
            });
        });

        var graph = new Graph({size: [window.innerWidth / 2, window.innerHeight / 3]});
        mainContext.add(new StateModifier({origin: [0.5, 0.5]})).add(graph);

        graph.title('positions of surfaces over time');
        _.each(rows, function (data, name) {
            graph.series(name, data, data[0].color);
        });
        graph.range('time').value('height').draw();

        console.log(rows);
    }

    // your app here

    var scroller = new ScrollContainer({
        scrollview: _.defaults({size: [300, 400]}, ScrollView.DEFAULT_OPTIONS),
        classes: ['myScroller']
    });

    var __color = _.template('rgb(<%= red %>,<%= green %>,<%= blue %>)');

    function _color(value) {
        var length = color_list.colors.length;
        value %= length;
        var color = color_list.colors[value] || [0, 0, 0];

        return __color({red: color[0], green: color[1], blue: color[2]});
    }

    scroller.sequenceFrom(_.map(_.range(0, 100), function (value, i) {
        var surface = new Surface({
            size: [300, 50],
            data: {
                'famous-id': i
            },
            classes: ['scroll-row'],
            properties: {
                backgroundColor: _color(value)
            }
        });

        surface.pipe(scroller);
        return surface;
    }));

    var scrollMod = new StateModifier({transform: Transform.translate(10, 10), size: [300, 400]});

    var buttonMod = new StateModifier({   transform: Transform.translate(300, 0, 0)   });

    mainContext.add(scrollMod).add(scroller);

    var runButton = new Surface({
        size: [300, 50],
        content: 'Click to scroll',
        properties: {
            backgroundColor: 'red',
            fontSize: '20pt',
            textAlign: 'center',
            paddingTop: '5px',
            color: 'white'
        },
        classes: ['run-button']
    });

    var time;
    scroller.scrollview._eventInput.on('start', function (data) {
        time = new Date().getTime();
        console.log('start: ', data);
    });
    scroller.scrollview._eventInput.on('update', function (data) {
        var t2 = new Date().getTime();
        console.log('update: ', data, t2 - time);
    });
    scroller.scrollview._eventInput.on('end', function (data) {
        console.log('end: ', data);
    });

    function _findScrolls() {
        var rows = document.getElementsByClassName('scroll-row');

        var out = [];
        var l = rows.length;

        for (var i = 0; i < l; ++i) {
            var ele = rows[i];
            if ((ele.style.display != 'none') && (ele.hasAttribute('data-famous-id'))) {
                var height = observer.getMatrix(ele, 13);

                if (height != null) {
                    out.push({
                        height: height,
                        row: parseInt(ele.getAttribute('data-famous-id'))
                    });
                }
            }

        }
        return out;
    }

    var clicked = false;
    runButton.on('click', function () {
        if (clicked) return;
        clicked = true;
        scroller.scrollview._eventInput.emit('start', {slip: true});
        buttonMod.setOpacity(0);
        setTimeout(function () {
            scroller.scrollview._eventInput.emit('update', {delta: -120, position: -120, velocity: -0.1, slip: true});
            setTimeout(function () {
                // scroller._eventInput.emit('end', {delta: -120, position: 0, velocity: 0, slip: true});
            }, 500)
        }, 10);

        var watchId = observer.startWatching(_findScrolls, {}, 100, 'rows');
        observer.startLogging('rows');

        setTimeout(function () {
            observer.stopWatching(watchId);
            observer.publish('rows', graph);
        }, 3000);
    });

    mainContext.add(buttonMod).add(runButton);

});