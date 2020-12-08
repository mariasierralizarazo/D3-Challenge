// @TODO: YOUR CODE HERE!

// SVG creation taken from class example 
// -------------------------------------------------------------------------------
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ------------------------------------------------------------------------------------

// Initial params 
var chosenXAxis = "poverty"
var chosenYAxis = "healthcare"

// Function to update x-scale 
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]),
        d3.max(data, d => d[chosenXAxis])
        ])
        .range([0, width]);

    return xLinearScale;
}
// Function to update y-scale 
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]),
        d3.max(data, d => d[chosenYAxis])
        ])
        .range([height, 0]);

    return yLinearScale;
}
// Function ToolTip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var label;
    var label2;

    if (chosenXAxis === "poverty") {
        label = "Poverty: ";
    }
    else {
        label = "Age: ";
    }

    if (chosenYAxis === "healthcare") {
        label2 = "Lacks Healthcare: "
    }
    else {
        label2 = "Smokes: "
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]} <br> ${label2} ${d[chosenYAxis]}`);
        });
    console.log(toolTip)
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}
// Funtion to update XAxis 
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Function to update YAxis 

function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}
function renderTextX(textGroup, newXScale, chosenXAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]))
    return textGroup;
}
function renderTextY(textGroup, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]))
    return textGroup;
}



// Load the data 
d3.csv("./assets/data/data.csv").then(function (data) {

    console.log(data);


    // parse data 
    data.forEach(function (d) {
        d.healthcare = +d.healthcare;
        d.poverty = +d.poverty;
        d.smokes = +d.smokes;
        d.age = +d.age;
        d.abbr = d.abbr;
        console.log(d.abbr);
    });

    // X linear scale
    var xLinearScale = xScale(data, chosenXAxis);

    // Y linear scale
    var yLinearScale = yScale(data, chosenYAxis);

    // Initial Axis functions 
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis 
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis 
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles 
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "green")
        .attr("opacity", ".5")
        .attr("alignment-baseline", "central");

    var textGroup = chartGroup.append("g")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .attr("alignment-baseline", "central")
        .attr("text-anchor", "middle")
        .style("font-weight", "bold");


    // Create group for two x-axis labels
    var labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In poverty (%)");

    var ageLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    // Create a group for two y-axis labels
    var labelsGroupY = chartGroup.append("g");

    var healthLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", 0 - (height / 2) + 5)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    // Tooltip function 
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    labelsGroupX.selectAll("text")
        .on("click", function () {
            var valueX = d3.select(this).attr("value");
            if (valueX !== chosenXAxis) {
                chosenXAxis = valueX;
                xLinearScale = xScale(data, chosenXAxis);
                xAxis = renderAxesX(xLinearScale, xAxis);
                circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = renderTextX(textGroup, xLinearScale, chosenXAxis);
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    circlesGroup.attr("fill","blue");
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    circlesGroup.attr("fill","green");
                }
            }
        });

    labelsGroupY.selectAll("text")
        .on("click", function () {
            var valueY = d3.select(this).attr("value");
            if (valueY !== chosenYAxis) {
                chosenYAxis = valueY;
                yLinearScale = yScale(data, chosenYAxis);
                yAxis = renderAxesY(yLinearScale, yAxis);
                circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = renderTextY(textGroup, yLinearScale, chosenYAxis);
                if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    circlesGroup.attr("fill","red");
                }
                else {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    circlesGroup.attr("fill","orange");
                }
            }
        });

}).catch(function (error) {
    console.log(error);
});
