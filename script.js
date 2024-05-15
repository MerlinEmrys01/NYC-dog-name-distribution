var width = 1400;
var height = 800;

var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

var Tooltip = d3.select("#my_dataviz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

var mouseover = function(event, d){
  Tooltip.style("opacity", 1);}
var mousemove = function(event, d){
  Tooltip
    .html('<u>' + d.key + '</u>' + "<br>" + d.value.count + " dogs")
    .style("left", (event.pageX + 20) + "px")
    .style("top", (event.pageY - 30) + "px");}
var mouseleave = function(event, d){
  Tooltip.style("opacity", 0);}


function createLegend(){
  var legend = d3.select("#legend");
  legend.selectAll(".legend-item").remove();
  var legendData = [
    {gender: "Male", color: "blue"},
    {gender: "Female", color: "red"}];
  var legendItem = legend.selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("div")
    .attr("class", "legend-item");
  legendItem.append("div")
    .attr("class", "legend-color")
    .style("background-color", d => d.color);
  legendItem.append("span")
    .text(d => d.gender);}




function updatePlot(year){
  d3.csv('cleaned_dog.csv').then(function(data){
    console.log("success:", data);
    var filteredData = data.filter(d => d.AnimalBirthYear == year);
    console.log("filtered", year, ":", filteredData);
    var nameCounts = Array.from(
      d3.group(filteredData, d => d.AnimalName),
      ([key, value]) => ({
        key: key,
        value: {
          count: value.length,
          gender: value[0].AnimalGender}}));
    console.log("check counts", nameCounts);
    // pop up window
    if (nameCounts.length === 0) {
      alert("No data available for the year: " + year);
      return;
    }
    var color = d3.scaleOrdinal()
      .domain(["M", "F"])
      .range(["blue", "red"]);

    // make bubble size more obvious
    var size = d3.scaleSqrt()
      .domain([1, d3.max(nameCounts, d => d.value.count)])
      .range([5, 55]);
    svg.selectAll(".node").remove();
    var node = svg.append("g")
      .selectAll("circle")
      .data(nameCounts)
      .enter()
      .append("circle")
        .attr("class", "node")
        .attr("r", d => size(d.value.count))
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .style("fill", d => color(d.value.gender))
        .style("fill-opacity", 0.8)
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
    // got help from https://github.com/d3/d3-force  
    // https://d3-graph-gallery.com/graph/circularpacking_template.html        
    var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(.1)) 
        .force("collide", d3.forceCollide().strength(.2).radius(d => size(d.value.count) + 3).iterations(1));
    simulation
        .nodes(nameCounts)
        .on("tick", function(d){
          node
              .attr("cx", d => d.x)
              .attr("cy", d => d.y);});
    function dragstarted(event, d){
      if (!event.active) simulation.alphaTarget(.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d){
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d){
      if (!event.active) simulation.alphaTarget(.03);
      d.fx = null;
      d.fy = null;
    }
    createLegend();

  }).catch(function(error) {
    console.error("Error loading or processing data:", error);});
}





d3.select("#update-button").on("click", function(){
  var year = d3.select("#year-input").property("value");
  if (year){
    updatePlot(year);
  } 
  else{
    alert("Please enter a valid year.");
  }});

createLegend();
