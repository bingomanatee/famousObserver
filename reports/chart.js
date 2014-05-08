    var svg = dimple.newSvg("#chartContainer", 800, 800);

    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(120, 100, 750, 550);
    var x = myChart.addAxis("x", "time");
    x.showGridlines = true;
    x.addOrderRule("time");

    var y = myChart.addMeasureAxis("y", "height", null);
    //.overrideMax=(max);
    y.overrideMin = 0;
    y.overrideMax = 1000;
    y.tickFormat = "d";

    var s = myChart.addSeries("row", dimple.plot.line);
    s.lineWeight = 1;
    s.lineMarkers = true;
    s.addOrderRule(function(n){
        return n.row;
    });


    myChart.addLegend(0, 0, 900, 100, "left", s);
    myChart.draw();
