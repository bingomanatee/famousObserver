var _ = require('lodash');
var RowSeries = require('./RowSeries');
var ss = require('simple-statistics');

function Series(records, key) {
    this.rows = {};
    this.key = key;
    _.each(records, this.addRecord, this);
}

Series.prototype = {

    addRecord: function (record) {
        var time = record.time;
        _.each(record.result, function (result) {
            var row = '' + result.row;
            if (!this.rows.hasOwnProperty(row)) {
                this.rows[row] = new RowSeries(this, result.row);
            }
            this.rows[row].add(result.height, record.time);
        }, this)
    },

    report: function () {
        _.each(this.rows, function (rs) {
            console.log('row: %s, result: %s', rs.row, rs.summary());
        });
    },

    d3Data: function (str, f, n) {
        var data = _.map(this.rows, function (row, name) {
            return {
                row: name,
                data: row.d3Data()
            }
        });

        return str ? JSON.stringify(data, f, n) : data;
    },

    d3DataFlat: function (str, f, n) {
        var data = _.map(this.rows, function (row, name) {
            return {
                row: name,
                data: row.d3Data()
            }
        });

        data = _.reduce(data, function (out, row) {
            return out.concat(_.map(row.data, function (d) {
                return _.extend({row: row.row}, d);
            }))
        }, []);

        return str ? JSON.stringify(data, f, n) : data;
    },

    summary: function (str, f, n) {
        var data = _.map(this.rows, function (row) {
            return _.extend({row: row, stdev: row.stdev()}, row.regression());
        });
        var stdev = 1000 * ss.median(_.pluck(data, 'stdev'));
        var slope = 1000 * ss.median(_.pluck(data, 'slope'));

        var agg = {stdev: stdev, slope: slope, key: this.key};

        return str ? JSON.stringify(agg, f, n) : agg;
    }
};

module.exports = Series;