var _ = require('lodash');
var ss = require('simple-statistics');

function RowSeriesItem(h, t, rs){
    this.rs = rs;
    this.h = h;
    this.t = t;
    this.index = rs.data.length;
}

RowSeriesItem.prototype = {
    dh: function(){
        if (this.index > 0 ){
            return this.h - this.prev().h;
        } else {
            return 1;
        }
    },

    dt: function(){
        if (this.index > 0){
            return this.t - this.prev().t;
        } else {
            return 1;
        }
    },

    slope: function(){
      if (this.index == 0){
          return 0;
      }  else {
          return this.dh()/this.dt();
      }
    },

    prev: function(){
        return this.rs.data[this.index - 1];
    },

    d3Data: function(){
        return {
            height: this.h,
            time: this.t,
            date: new Date(this.t).toString()
        };
    }
};

function RowSeries(series, row) {
    this.series = series;
    this.row = row;
    this.data = [];
}

var _summary = _.template('(ht: <%= h %> @  <%= t %>)');

RowSeries.prototype = {
    add: function (height, time) {
        this.data.push(new RowSeriesItem(height, time, this));
    },

    d3Data: function(){
      return _.map(this.data, function(d){
          return d.d3Data();
      })
    },

    summary: function () {

        this.data = _.sortBy(this.data, 't');
        if (this.data.length < 5){
            return '(short row)';
        }
        var out = '';
        function _append(item) {
          //  out += _summary(item);
        }

        _.each(this.data.slice(0, 3), _append);
       // out += ' ... ';

        _append(_.last(this.data));

        var slopes = this.slopes();

        out += "\n" + slopes.slice(0, 8).join(',');
        out += "\n" + JSON.stringify(this.regression());
        out += "\n standard deviation: " + this.stdev();
        return out;
    },

    dataArray: function(){
        return _.map(this.data, function(rsi){
            return [rsi.t, rsi.h];
        })
    },

    regression: function(){
        var lr = ss.linear_regression().data(this.dataArray());
        return {
            slope: lr.m(),
            intercept: lr.b()
        }
    },

    slopes: function(){
      return  _.map(this.data.slice(1), function(rsi){
            if (!rsi || (!rsi.slope)){
                throw 'wtf';
            }
            return rsi.slope();
        });
    },

    stdev: function(){
        return ss.standard_deviation(this.slopes());
    }


};

module.exports = RowSeries;