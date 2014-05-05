# FamousObserver

Creates a singleton that sends messages back and forth between various componnents and the public namespace.
Designed to facilitate testing and benchmarking of Famous components.

FamousObserver is about recording data and exposing it in dom in such a way that it can be harveted by a test construct.
FamousObserver relies heavily on Famous' event system.

The basic mechanic of Observer is that it repeatedly calls a function or object method, broadcasting the result
as a message. Other listeners record this into a log array in the observer.

When the tests are done, calling `observable.publish(logName, domName)` will export your results as JSON
into a hidden DOM element (which does not have to exist at the time).

It is useful to note that most transforms in Famous have a callback (optional) which is a convenient place
to put your publish imperitave (as below).

## Example of Observer in action

``` javascript

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