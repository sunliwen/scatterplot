
// chart margin
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// scale of axises
var x = d3.scale.linear()
    //.domain([0, 13152])  // TODO, 13152 hours 548 days 18 months
    .range([0, width]);

var y = d3.scale.linear()
    //.domain([0, 100])  // TODO, max of count of ratings
    .range([height, 0]);

var z = d3.scale.category10();

var color = d3.scale.category10();

// styling of axises
var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left");

// init svg into the given div
var svg = d3.select("#div1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// loading
svg.append("text")
    .attr("class", "loading")
    .text("Loading ...")
    .attr("x", function () { return width/2; })
    .attr("y", function () { return height/2-5; });

// // x-axis label
// svg.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")")
//     .call(xAxis)
//   .append("text")
//     .attr("class", "label")
//     .attr("x", width)
//     .attr("y", -6)
//     .style("text-anchor", "end")
//     .text("Time span (hour)");


// // y-axis label
// svg.append("g")
//     .attr("class", "y axis")
//     .call(yAxis)
//   .append("text")
//     .attr("class", "label")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 6)
//     .attr("dy", ".71em")
//     .style("text-anchor", "end")
//     .text("Rating (s)");

d3.tsv("loose.tsv", function(data) {

  // Coerce the strings to numbers.
  data.forEach(function(d) {
    d.x = +d.x;
    d.y = +d.y;
  });

  // Compute the scales’ domains.
  x.domain(d3.extent(data, function(d) { return d.x; })).nice();
  y.domain(d3.extent(data, function(d) { return d.y; })).nice();

  // Add the x-axis.
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis().scale(x).orient("bottom"));

  // Add the y-axis.
  svg.append("g")
      .attr("class", "y axis")
      .call(d3.svg.axis().scale(y).orient("left"));

  svg.selectAll(".loading").remove();

  // Add the points!
  svg.selectAll(".point")
      .data(data)
    .enter().append("path")
      .attr("class", "point")
      .attr("d", d3.svg.symbol().type("circle"))
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
});
