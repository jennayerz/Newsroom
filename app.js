d3.select(window).on("resize", resize);

resize();

function resize() {

    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    var svgWidth = 960;
    var svgHeight = 500;

    var margin = { top: 20, right: 40, bottom: 80, left: 100};

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3. select(".chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var chart = svg.append("g");

    d3.csv("data/data.csv", function(err, houseData) {
        if (err) {
            throw err;
        }

        console.log(houseData);

        houseData.forEach(function(data) {
            data.id = +data.id;
            data.state = data.state;
            data.abbrev = data.abbrev;
            data.homeOwner = +data.homeOwner;
            data.familyHousehold = +data.familyHousehold;
            data.raceWhite = +data.raceWhite;
            data.raceBlack = +data.raceBlack;
            data.raceAsian = +data.raceAsian;
        });

        // d3.select(window).on('resize', resize); 

        // function resize() {

            var yLinearScale = d3.scaleLinear()
                .range([height, 0]);

            var xLinearScale = d3.scaleLinear()
                .range([0, width]);
            
            var bottomAxis = d3.axisBottom(xLinearScale);
            var leftAxis = d3.axisLeft(yLinearScale);

            xLinearScale.domain([20, d3.max(houseData, function(data) {
                return +data.familyHousehold;
            })]);

            yLinearScale.domain([0, d3.max(houseData, function(data) {
                return +data.homeOwner;
            })]);
            
            var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([110, -80])
            .html(function(data) {
                var familyHousehold = +data.familyHousehold;
                var homeOwner = +data.homeOwner;
                var state = data.state;
                var raceWhite = +data.raceWhite;
                var raceBlack = +data.raceBlack;
                var raceAsian = +data.raceAsian;
                return (state + "<br> % of homeowners: " + homeOwner + "<br> % of family households: " + familyHousehold + "<br> % of White American homeowners: " + raceWhite + "<br> % of Asian American homeowners: " + raceAsian);
            });

            chart.call(toolTip);

            chart.selectAll("circle")
                .data(houseData)
                .enter()
                .append("circle")
                .attr("cx", function(data, index) {
                    return xLinearScale(data.homeOwner);
                })
                .attr("cy", function(data, index) {
                    return yLinearScale(data.familyHousehold);
                })
                .attr("r", "10")
                .attr("fill", "tomato")
                .on("mouseover", toolTip.show)
                .on("mouseout", toolTip.hide);

            chart.append("g")
                .attr("transform", `translate(0, ${height})`)
                .attr("class", "x-axis")
                .call(bottomAxis);
            
            chart.append("g")
                .call(leftAxis);

            chart.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 40)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .attr("class", "axisText")
                .text("% of family households");
            
            chart.append("text")
                .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 15) + ")")
                .attr("class", "axis-text active")
                .attr("data-axis-name", "homeOwner")
                .text("% of homeowners")

            chart.append("text")
                .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 30) + ")")
                .attr("class", "axis-text inactive")
                .attr("data-axis-name", "raceWhite")
                .text("% of homeowners - White Americans");

            chart.append("text")
                .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")")
                .attr("class", "axis-text inactive")
                .attr("data-axis-name", "raceBlack")
                .text("% of homeowners - Black Americans");

            chart.append("text")
                .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 60) + ")")
                .attr("class", "axis-text inactive")
                .attr("data-axis-name", "raceAsian")
                .text("% of homeowners - Asian Americans");

            function labelChange(clickedAxis) {
                d3
                    .selectAll(".axis-text")
                    .filter(".active")
                    .classed("active", false)
                    .classed("inactive", true);
                
                clickedAxis.classed("inactive", false).classed("active", true);
            }

            function findMinAndMax(dataColumnX) {
                return d3.extent(houseData, function(data) {
                    return +data[dataColumnX];
                });
            }

            d3.selectAll(".axis-text").on("click", function() {
                var clickedSelection = d3.select(this);
                var isClickedSelectionInactive = clickedSelection.classed("inactive");
                var clickedAxis = clickedSelection.attr("data-axis-name");

                if (isClickedSelectionInactive) {
                    xLinearScale.domain(findMinAndMax(clickedAxis));

                    svg
                        .select(".x-axis")
                        .transition()
                        .duration(1800)
                        .call(bottomAxis);
                    
                    d3.selectAll("circle").each(function() {
                        d3
                            .select(this)
                            .transition()
                            .attr("cx", function(data) {
                                return xLinearScale(+data[clickedAxis]);
                            })
                            .duration(1800);
                    });

                    labelChange(clickedSelection);
                }
            });
        });
}