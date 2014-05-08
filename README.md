# FamousObserver

famousObserver is a general library for running functions repeatedly, capturing and timestamping that output,
and reporting it back for validation purposes.

The primary intended focus of FamousObserver is testing.

## Introduction

Creates a singleton that sends messages back and forth between various componnents and the public namespace.
Designed to facilitate testing and benchmarking of Famous components.

FamousObserver is about recording data and exposing it in dom in such a way that it can be harveted by a test construct.
FamousObserver relies heavily on Famous' event system.

The basic mechanic of Observer is that it repeatedly calls a function or object method, broadcasting the result
as a message. Other listeners record this into a log array in the observer.

When the tests are done, calling `observable.publish(logName, domName)` will export your results as JSON
into a hidden DOM element (which does not have to exist at the time).

It is useful to note that most transforms in Famous have a callback (optional) which is a convenient place
to put your publish command (as below).

## Dependencies/Environment

famousObserver depends on require.js. It does *not* depend on Famous directly - it can be used to test anything
that you need to repeatedly measure and report on. it was *designed* to test Famous' code, but anything that
is in the generaal integrated test/browser/JS school can benefit from famousObserver.

famousObserver is NOT a test runner. It can be used by a test runner to record and measure behavior. As such
it can run with any test runner -- Selenium/WebDriver, Mocha, Tap, PhantomJS, etc.

famousObserver is designed to run in the browser -- it is not a node.js module.

## Using FamousObserver

FamousObserver is meant to be in the famous folder, a sibing of core etc. see the testObserver sample project.

FamousObserver can be accessed by requiring it; if for some reason you need to access it from other contexts (such
as a wd script) it also attaches itself to the window object as $famousObserver.

note -- observer is a singleton -- it exports a single instance of itself; you don't call `new Observer()`,
just use the observer returned by `require('famous/observer/Observer');`.

The basic flow of observer is:

1. Create a function you want to call repeatedly (`getInforFromDom`).
2. Call `observer.startWatching(getInfoFromDom, argsOrBase, frequency, broadcastMessage)`.
3. Repeat as necessary for other things to observe
4. When you are ready to start recording call `observer.startLogging('resultName');`
5. When you are done measuring output call `observer.publish('resultName', 'divID')` to write the result
   into a hidden dom element. (will create one if necessary.
6. Report the data as desired to your test framework.

A hint as to how to "identify" objects to measure: give each surface a unique CSS style. use those styles as IDs
to locate the subject of your tests.

## Performance impact

The observer framework is as light as possible; it doesn't change the dom until you are done with your measurements.
That being said, its impossible to guarantee that it is perfectly transparent. If getting as close as possible to
zero impact on performance is the goal, take as few measurements as possible.

## Example of Observer in action

![screenshot](/screenshot.png "Graphing output of observer")

``` javascript

    // import dependencies
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var observer = require('famous/observer/Observer');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Easing = require('famous/transitions/Easing');

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
```

## IMPORTANT ! Prerequisites for running the examples

The examples checked in were created with [generator-famous](https://github.com/Famous/generator-famous).
As such you must

1. have generator-famous installed globally
2. run `bower install` in each of the test* (testObserver, tesdtScroll...) folders
   to pull in/refresh the `lib` directory.
3. run `grunt build` from the root to copy observer into each test case.

*it is very important that these steps be done in this order.* -- step 2 creates the lib folder
and famous folder into which the observers' folder must be copied.

Read individual scenario README.md's for further details

## eleSerialize

`eleSerialize` is a function that takes in an element (or an element spec) and returns a JSON-friendly summary
of its qualities.

Properties of interest can be enumerated as an array including some or all of the following values:

* 'style'
* 'style:display,left,...' or any number of style properties.
* 'visible' : returns a boolean based on true visibility.
* 'matrix' : returns the net transform matrix
* 'content' : returns the content of the element (in string form).
* 'classes' : an array of strings
* 'size' : an array of the height and width of the element (in pixels).

`eleSerialize` requires `famous/core/Transform` to do matrix calculations. (its lazy loaded when 'matrix' is requested)

See testEleSer for usage examples.