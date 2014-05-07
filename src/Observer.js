/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: felix@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

define(function (require, exports, module) {
        var EventHandler = require('famous/core/EventHandler');
        var _ = require('./lodashLite');
        var Transform = require('famous/core/Transform');

        /**
         * This is a class for bridging internal processes in Famous (and other code)
         * to a local log for use in testing and performance monitoring.
         *
         * There is only one obserer and it is available as windows.$famousObserver
         *
         * @constructor
         */
        function Observer() {
            this.eventOutput = new EventHandler();
            this.eventInput = new EventHandler();
            EventHandler.setInputHandler(this, this.eventInput);
            EventHandler.setOutputHandler(this, this.eventOutput);

            this.logs = {};
        }

        /**
         * records a message to the logs
         *
         * @param message
         * @param err
         * @param result
         * @param time
         */
        Observer.prototype.broadcast = function (message, err, result, time) {
            var out = {
                time: new Date().getTime() - time,
                error: err,
                result: result
            };

            this.eventOutput.emit(message, out);
        };

        /**
         * initializes a log entry for a given message
         * and listens for traffic, routing it to the log
         *
         * @param message
         */
        Observer.prototype.startLogging = function (message) {
            if (!this.logs.hasOwnProperty(message)) {
                this.logs[message] = [];
                var self = this;

                this.eventOutput.on(message, function (out) {
                    self.logs[message].push(out);
                });
            }
        };

        /**
         * Export log data to a function or a dom element.
         *
         * @param message {string} the name of teh log entry
         * @param targetfnOrId {Function | String}
         * @param empty {boolean} a flag to reset the log
         */
        Observer.prototype.publish = function (message, targetfnOrId, empty) {
            if (typeof targetFnOrId != 'undefined' && targetFnOrId) {
                if (typeof targetfnOrId == 'function') {
                    targetfnOrId(this.logs[message] || []);
                } else if (_.isString(message)) {
                    var targetEle = document.getElementById(targetfnOrId);
                    if (!targetEle) {
                        document.body.insertAdjacentHTML('afterend', '<div id="' + targetfnOrId + '" style="display: none"></div>');
                        targetEle = document.getElementById(targetfnOrId);
                    }
                    //@TODO: fail insulation

                    targetEle.innerHTML = JSON.stringify(this.logs[message]);
                    if (empty) {
                        this.logs[message] = [];
                    }
                }
            } else {
               return this.logs[message];

            }
        };

        /**
         * begins observing activity; repeatedly calls a function or method at regular intervals
         *
         * @param target {Object|Function}
         * @param processOrBase
         * @param frequency
         * @param broadcastMessage
         * @returns {*}
         */
        Observer.prototype.startWatching = function (target, processOrBase, frequency, broadcastMessage) {
            frequency = Math.max(100, frequency || 250);

            var base;
            var si;
            var time;
            var self = this;
            var args = [];

            if (typeof target == 'function') {

                if (_.isArray(processOrBase)) {
                    base = processOrBase.shift();
                    args = processOrBase;
                } else if (typeof processOrBase == 'object') {
                    base = processOrBase;
                    args = [];
                }

                time = new Date().getTime();

                si = setInterval(function () {
                    var result, error;
                    try {
                        result = target.apply(base, args);
                    } catch (e) {
                        error = e;
                    }

                    if (broadcastMessage) {
                        self.broadcast(broadcastMessage, error, result, time);
                    }
                }, frequency);

            } else if (typeof target == 'object') {

                var method = _.isArray(processOrBase) ? processOrBase.shift() : _.isString(processOrBase) ? processOrBase : null;
                if (_.isArray(processOrBase)) {
                    args = processOrBase;
                }

                if (!method) {
                    throw 'bad process';
                }

                time = new Date().getTime();

                si = setInterval(function () {
                    var result, error;

                    try {
                        result = target[method].apply(target, args);
                    } catch (err) {
                        error = err;
                    }

                    if (broadcastMessage) {
                        self.broadcast(message, error, result, time)
                    }

                }, frequency);

            } else {
                throw 'bad target'
            }

            return si;
        };

        Observer.prototype.stopWatching = function (id) {
            clearInterval(id);
        };

        // note - is a singleton broker.

        module.exports = new Observer();
        if (window) {
            window.$famousObserver = module.exports;
        }
    }
)
;