var svg = dimple.newSvg("#chartContainer", 800, 800);

var myChart = new dimple.chart(svg, agg);
myChart.setBounds(120, 100, 750, 550);
var x = myChart.addCategoryAxis("x", "key");
x.showGridlines = true;
x.addOrderRule("time");

var y = myChart.addMeasureAxis("y", "stdev", null);
//.overrideMax=(max);
//y.overrideMin = 0;
//y.overrideMax = 0.05;
y.tickFormat = "d";
//y.ticks = 100;

var s = myChart.addSeries("row", dimple.plot.line);
s.lineWeight = 1;
s.lineMarkers = true;
s.addOrderRule(function(n){
    return n.row;
});


myChart.addLegend(0, 0, 900, 100, "left", s);
myChart.draw();

var svg = dimple.newSvg("#chartContainer2", 800, 800);

var myChart = new dimple.chart(svg, agg);
myChart.setBounds(120, 100, 750, 550);
var x = myChart.addCategoryAxis("x", "key");
x.showGridlines = true;
x.addOrderRule("time");

var y = myChart.addMeasureAxis("y", "slope", null);
//.overrideMax=(max);
y.overrideMin = -100;
y.overrideMax = -90;
y.tickFormat = "d";
//y.ticks = 100;

var s = myChart.addSeries("row", dimple.plot.line);
s.lineWeight = 1;
s.lineMarkers = true;
s.addOrderRule(function(n){
    return n.row;
});


myChart.addLegend(0, 0, 900, 100, "left", s);
myChart.draw();
