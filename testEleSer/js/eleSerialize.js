/**
 * A basic graphing abstract
 *
 */
define(function (require, exports, module) {
    var _ = require('./lodashLite');
    var isVisible = require('./isVisible');

    function _netMatrix(ele) {
        return _compressMatrices(_pollMatrix(ele));
    };

    var matrixRegex = /matrix3d\(([^(]+)\)/;

    /**
     *
     * returns a nested set of all the matrices of the elements branch.
     *
     * @param ele {domElement}
     * @returns {[[float x 16]]} an array of one or more arrays of 16 numbers
     */

    function _pollMatrix(ele) {
        var transform = ele.style['-webkit-transform'];

        var out = [];
        if (transform && matrixRegex.test(transform)) {
            var match = matrixRegex.exec(transform);
            out = _.map(match[1].split(/ +/g), function (n) {
                return parseFloat(n, 10);
            })
        }

        if (ele.parentElement) {
            out = this.getMatrix(ele.parentElement).concat([out]);
        } else {
            out = [out];
        }

        return out;
    }

    function _compressMatrices(matrices) {
        matrices.reverse();
        return _.reduce(matrices, function (o, m) {
            if (m.length) {
                return Transform.multiply4x4(o, m);
            } else {
                return o;
            }

        }, Transform.identity.slice(0));
    }

    function _style(element, tags) {
        var i;
        var out = {};
        var css = window.getComputedStyle(element);
        if (tags) {
            for (i = 0; i < tags.length; ++i) {
                try {
                    if (tags[i]) {
                        out[tags[i]] = css.getPropertyValue(tags[i]);
                    }
                } catch (err) {
                    // dont care -- missing element, wierd format, whatever
                }
            }
        } else {
            for (i = 0; i < css.length; i++) {
                // console.log(css[i] + '=' + css.getPropertyValue("" + css[i]))
                out[css[i]] = css.getPropertyValue("" + css[i]);
            }
        }
        return out;
    }

    /**
     * this is a "local toolkit" for estracting properties or groups of properties from an element.
     *
     */
    var serialize = {
        /**
         *
         * @param ele {domElement}
         * @returns {[int (x 16)]} the effetive matrix of an element.
         *           returns identity matrix on a non-transformed element.
         */
        matrix: _netMatrix,
        style: _style,
        computedstyle: function (ele) {
            return window.getComputedStyle(ele)
        },
        classes: function serClasses(ele) {
            return ele.className ? ele.className.split(/ +/g) : [];
        },
        visible: isVisible,
        size: function (ele) {
            return [ele.offsetWidth, ele.offsetHeight]
        },
        content: function (ele) {
            return ele.innerHTML;
        }
    };

    function _isDomElement(e) {
        return e || _.isObject(e);
        //@TODO: better introspection
    }

    module.exports = function serializeEle(ele, list) {
        list = list || ['matrix', 'style', 'classes', 'size', 'content'];
        if (!_isDomElement(ele)) {
            return _.reduce(list, function (out, n) {
                if (/^style/.test(n)) {
                    n = 'style';
                }
                switch (n) {
                    case 'visible':
                        out[n] = false;
                        break;

                    case 'classes':
                        out[n] = [];
                        break;

                    case 'style':
                        out[n] = {};
                        break;

                    default:
                        out[n] = null;

                }
                return out;
            }, {});
        }

        var out = {};
        _.each(list, function (measure) {
            if (/^style:/.test(measure)) {
                var m = /style:(.*)/.exec(measure);
                var tags = m[1].split(/[ ,]+/g);
                out.style = _style(ele, tags);
            } else {
                out[measure] = serialize[measure](ele)
            }
        });

        return out;
    };

});