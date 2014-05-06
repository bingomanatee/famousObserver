/**
 * A basic graphing abstract
 *
 */
define(function (require, exports, module) {
    var DataSurface = require('./DataSurface');
    var Transform = require('famous/core/Transform');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Modifier = require('famous/modifiers/StateModifier');
    var View = require('famous/core/View');
    var _ = require('./lodashLite');
    var RANGE_LABEL_HEIGHT = 25;

    function Graph(opts) {
        View.call(this, opts);

        this.background = new ContainerSurface({
            size: (opts ? opts.size : null) || [undefined, undefined],
            classes: ['graph'],
            properties: {
            }
        });

        this._title = new ContainerSurface({
            size: [undefined, 40]
        });
        this.background.add(new Modifier({origin: [0.5, 0]})).add(this._title);

        // a transparent boundry region that doesn't cover the range labels
        this._dataContainer = new ContainerSurface({size: [undefined, this.background.size[1] - RANGE_LABEL_HEIGHT]});

        this.background.add(new Modifier({origin: [0, 0]}))
            .add(this._dataContainer);

        this._series = [];

        this.graphType = opts && opts.graphType ? opts.GraphType : 'plot';

        this.valueName = 'value';

        this.rangeName = 'time';

        this._node.add(this.background);
    }

    Graph.prototype = Object.create(View.prototype);

    _.extend(Graph.prototype, {

        bgColor: function (c, c2) {
            if (c) {
                this.background.setProperties({backgroundColor: c});
            }
            if (c2) {
                this.background.setProperties({color: c2});
            }
            return this;
        },

        series: function (name, data, color) {
            this._series.push({name: name, color: color || 'black', data: data || []});
            return this;
        },

        draw: function () {
            var range = this._calcRange();

            this.rangeMinLabel().setContent(range[0]);

            this.rangeMaxLabel().setContent(range[1]);

            this._drawData(range);
        },

        _drawData: function (range) {
            if (!range) {
                range = this._calcRange();
            }

            var valueRange = this._calcValueRange();
            var valueExtent = valueRange[1] - valueRange[0];
            var rangeExtent = range[1] - range[0];
            var height = this.background.size[1] - RANGE_LABEL_HEIGHT;
            var self = this;

            _.each(this._series, function (item) {
                _.each(item.data, function (p) {
                    var value = p[self.valueName];
                    var r = p[self.rangeName];

                    var pValue = value - valueRange[0];
                    pValue /= valueExtent;

                    var pRange = r - range[0];
                    pRange /= rangeExtent;

                    var pip = self._pipSurface(r, value, item.color);
                    self._dataContainer.add(new Modifier({origin: [pRange, pValue]})).add(pip);
                })
            })
        },

        _pipSurface: function (range, value, color) {
            return new DataSurface({
                size: [5, 5],
                data: {
                    range: range,
                    value: value,
                },
                properties: {
                    backgroundColor: color || 'black'
                },
                classes: ['data-pip']
            })
        },

        _labelSurface: function () {
            return   new DataSurface({
                content: 'asdkjfhakjsd',
                size: [120, RANGE_LABEL_HEIGHT],
                classes: ['graph-label', 'range-label']
            })
        },

        rangeMinLabel: function () {
            console.log('outside')
            if (!this._rangeMinLabel) {
                console.log('inside')
                this._rangeMinLabel = this._labelSurface();
                this._rangeMinLabel.addClass('range-label-min');
                this.background.add(new Modifier({
                    origin: [0, 1],
                    size: [120, RANGE_LABEL_HEIGHT]
                })).add(this._rangeMinLabel);
            }

            return this._rangeMinLabel;
        },

        rangeMaxLabel: function () {
            if (!this._rangeMaxLabel) {
                this._rangeMaxLabel = this._labelSurface();
                this._rangeMaxLabel.addClass('range-label-max');
                this.background.add(new Modifier({
                    origin: [1, 1],
                    size: [120, RANGE_LABEL_HEIGHT]
                })).add(this._rangeMaxLabel);
            }

            return this._rangeMaxLabel;
        },

        _calcRange: function () {
            var min = '.';
            var max = '.';
            var rangeName = this.rangeName;
            _.each(this._series, function (series) {
                _.each(series.data, function (value) {
                    if (!value.hasOwnProperty(rangeName)) {
                        return;
                    }
                    var rangeValue = value[rangeName];

                    if (min == '.' || (min > rangeValue)) {
                        min = rangeValue;
                    }

                    if (max == '.' || (max < rangeValue)) {
                        max = rangeValue;
                    }
                })
            });

            return [min, max];
        },

        range: function (name) {
            if (name) {
                this.rangeName = name;
            }

            return name ? this : this._calcRange();
        },

        _calcValueRange: function () {
            var min = '.';
            var max = '.';

            var valueName = this.valueName;

            _.each(this._series, function (series) {
                _.each(series.data, function (data) {
                    if (!data.hasOwnProperty(valueName)) {
                        return;
                    }
                    var dv = data[valueName];

                    if ((min == '.') || (min > dv)) {
                        min = dv;
                    }

                    if ((max == '.') || (max < dv)) {
                        max = dv;
                    }
                });
            });

            return [min, max];
        },

        value: function (name) {
            if (name) {
                this.valueName = name;
            }

            return name ? this : this._calcValueRange();
        },

        getSeries: function (name) {
            for (var i = 0; i < this._series.length; ++i) {
                if (this._series[i].name == name) {
                    return this._series[i];
                }
            }

            return this.series(name)._series[name];
        },

        seriesValue: function (name, value) {
            this.getSeries(name).data.push(value);
            this.draw();
            return this;
        },

        title: function (t, f, s) {
            if (t) {
                this._title.setContent('<h2>' + t + '</h2>');
            }
            if (f) {
                this._title.setProperties({
                    fontFamily: f
                })
            }

            if (s) {
                if (!isNaN(s)) {
                    if (s < 1) s *= 100;
                    s += '%';
                }
                this._title.setProperties({
                    fontSize: s
                });
            }
            return this;
        }

    });

    module.exports = Graph;

})
;