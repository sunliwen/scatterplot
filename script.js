
var target_plots = [];

function initTargetIdList() {
  $.ajax({
    url: "data/target_ids.json"
  })
  .done(function(resp) {
    // a init dropdown list

    var data = [];

    function format(item) { return item.text; }

    $.each(resp, function(target_id, hash){
      data.push({id: hash, text: target_id});
    });

    $("#target_list").select2({
      data: { results: data, text: 'text' }
      ,formatSelection: format
      ,formatResult: format
    });

    $("#target_list").on("change", function(e) {
      console.log(e.val);
      console.log(e.added);

      if (e.added) {
        console.log("e.added");
        if ( -1 === $.inArray(e.added.id, target_plots)){
          console.log("create new plot");
          target_plots.push(e.added.id);
          drawPlot(e.added.id, e.added.text);
        }
      } else {
        console.log("!e.added");
      }
    });
  });
}

// chart margin
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    //width = 960 - margin.left - margin.right,
    width = 1400 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// scale of axises
var x = d3.scale.linear()  // TODO, 13152 hours 548 days 18 months
    .rangeRound([0, width]);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

// higher rating come with deeper color
var color = d3.scale.ordinal()
    .domain(["-1", "0", "1", "2"].reverse())
    .range(colorbrewer.YlOrRd[4].reverse());

// styling of axises
var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left");

function initCanvas(){
  if ($(".js-canvas").length!==0) {
    d3.select(".js-canvas").remove();
  }
}

function drawPlot(target_id_hash, plot_title) {

  sample_start = +new Date();

  // init svg into the given div
  var canvas_id = "canvas-" + target_id_hash;
  $("#plot_container").append('<div id="'+canvas_id+'" class="js-canvas"></div>');
  var svg = d3.select("#"+canvas_id)
    .append("svg")
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

  d3.tsv("data/"+target_id_hash+".tsv", function(data) {

    // Coerce the strings to numbers.
    data.forEach(function(d) {
      d.x = +d.date_hour;
      d.y = +d.count;
    });

    // Compute the scales’ domains.
    x.domain(d3.extent(data, function(d) { return d.x; }));
    y.domain(d3.extent(data, function(d) { return d.y; }));

    // Add the x-axis.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Time span (hour)");

    // Add the y-axis.
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Rating (s)");

    svg.selectAll(".loading").remove();

    // Add the points!
    svg.selectAll(".series")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .style("fill", function(d) { return color(d.rating); })
        .attr("r", 2)
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); });

    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (+i + 1) * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    sample_end = +new Date();
    sample_time = sample_end-sample_start;


    // Add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(plot_title + " - " + sample_time + "ms");
  });

}


