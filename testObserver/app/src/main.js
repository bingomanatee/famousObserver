/*globals define*/
define(function (require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var observer = require('famous/observer/Observer');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Easing = require('famous/transitions/Easing');

    // create the main context
    var mainContext = Engine.createContext();
    var GRAPH_WIDTH = window.innerWidth / 2;
    var GRAPH_HEIGHT = window.innerHeight / 3;

    var GRAPH_BOTTTOM_MARGIN = 30;
    var GRAPH_DRAW_HEIGHT = GRAPH_HEIGHT - GRAPH_BOTTTOM_MARGIN;

    var GRAPH_MARGIN = 75;
    var GRAPH_INNER_WIDTH = GRAPH_WIDTH - (2 * GRAPH_MARGIN);
    var GRAPH_INNER_HEIGHT = GRAPH_DRAW_HEIGHT - (2 * GRAPH_MARGIN);

    function graph() {
        var graphSurface = new ContainerSurface({
            size: [GRAPH_WIDTH, GRAPH_HEIGHT],
            properties: {
                backgroundColor: 'rgb(255, 245, 240)'
            }
        });

        mainContext.add(new StateModifier({origin: [0.5, 0.5]})).add(graphSurface);

        var data = JSON.parse(document.getElementById('box-ele-report').innerHTML);
        console.log(data);

        var minTime = ':';
        var maxTime = ':';

        var minHeight = ':';
        var maxHeight = ':';

        _.each(data, function (cell) {
            if ((minTime == ':') || (cell.time < minTime)) {
                minTime = cell.time;
            }

            if ((maxTime == ':') || (cell.time > maxTime)) {
                maxTime = cell.time;
            }

            var height = cell.result[13];

            if ((minHeight == ':') || (minHeight > height)) {
                minHeight = height;
            }

            if ((maxHeight == ':') || (maxHeight < height)) {
                maxHeight = height;
            }
        });

        var label = new Surface({content: '' + minTime, size: [100, GRAPH_BOTTTOM_MARGIN],
            classes: ['number-label-left']
        });
        graphSurface.add(new StateModifier({
            origin: [0, 1],
            transform: Transform.translate(GRAPH_MARGIN, 0)
        })).add(label);

        var label2 = new Surface({content: '' + maxTime, size: [100, GRAPH_BOTTTOM_MARGIN],
            classes: ['number-label-right']
        });
        graphSurface.add(new StateModifier({
            transform: Transform.translate(-GRAPH_MARGIN, 0),
            origin: [1, 1]
        })).add(label2);

        var points = [];



        _.each(data, function (cell) {
            var timePercent = (cell.time - minTime) / (maxTime - minTime);
            var heightPercent = (cell.result[13] - minHeight) / (maxHeight - minHeight);

            points.push({height: cell.result[13], time: cell.time, hp: heightPercent, tp: timePercent});
        });

        var backSurface = new Surface({
            classes: ['graph-border'],
            content: '<h2>Distance from top over time</h2><h3>inQuad</h3>',
            size: [GRAPH_WIDTH, GRAPH_DRAW_HEIGHT]
        });
        graphSurface.add(new StateModifier({origin: [0, 0]})).add(backSurface);

        _.each(points, function (pt) {
            var m = new StateModifier({
                origin: [0, 0],
                transform: Transform.translate(
                        GRAPH_MARGIN + (GRAPH_INNER_WIDTH * pt.tp),
                        GRAPH_MARGIN + (GRAPH_INNER_HEIGHT * (1 - pt.hp)),
                    0)
            });

            var pip = new ContainerSurface({
                size: [5, 5],
                properties: {
                    backgroundColor: 'black'
                }
            });

            graphSurface.add(m).add(pip);

            pip.add(new StateModifier({
                origin: [0, 0],
                transform: Transform.translate(10, 0, 0)
            })).add(new Surface({
                size: [20, 100],
                classes: ['pip-label'],
                content: pt.height
            }));

        });
    }


    //--- MAIN ---
    /**
     * The box is the object displayed.
     * We will be getting its transform-height during the observer cycle
     * @type {Surface}
     */
    var box = new Surface({
        size: [200, 200],
        content: 'Box',
        classes: ['box'],
        properties: {'backgroundColor': 'salmon', padding: '2em', color: 'white', fontFamily: 'Helvetica'}
    });

    /**
     * @type {StateModifier}
     */
    var boxModiifer = new StateModifier({
        origin: [0, 0]
    });

    mainContext.add(boxModiifer).add(box);
    /**
     * we are animating the sliding downwards of the box over time.
     * When the transformation is complete we will publish the results to a (hidden) dom element
     * then graph the result.
     */
    boxModiifer.setTransform(Transform.translate(0, 400, 0), {duration: 1500, curve: Easing.inQuad},
        function () {
            observer.publish('box-ele', 'box-ele-report');
            graph();
        }
    );

    var tre = /matrix3d\(([^(]+)\)/;

    /**
     * this method is called repeatedly to poll the elements' proerties.
     * we will call it four times a second.
     * @returns [{int}] the transform matrix values.
     */

    function getTransform() {
        var ele = document.getElementsByClassName('box')[0];
        if (!ele) {
            throw 'cannot find a box';
        }

        var transform = ele.style['-webkit-transform'];
        if (tre.test(transform)) {
            var match = tre.exec(transform);
            return _.map(match[1].split(/ +/g), function (n) {
                return parseInt(n, 10);
            })
        } else {
            return [];
        }

    }

    /**
     * this method calls getTransform every 250 ms and emits the resultign value in a message 'box-ele';
     */
    observer.startWatching(getTransform, [
        {}
    ], 50, 'box-ele');

    /**
     * This starts logging those emitted values into the observer.
     * In some circumstances you may not want to begin logging immediately.
     */
    observer.startLogging('box-ele')
});
