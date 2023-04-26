const margin = { top: 20, right: 30, bottom: 100, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const svg = d3
    .select("#general_plots2")
    .append("svg")
    .attr("preserveAspectRatio", "none")
    .attr("width", "100%")
    .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom
        }`
    )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let tooltip = d3
    .select("#general_plots")
    .append("div")
    .style("position", "absolute")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("color", "white")
    .style("background-color", "#11191f")
    .style("border", "none")
    .style("border-radius", "5px")
    .style("padding", "5px");

d3.csv("/data/koi_cumulative_v1.csv").then(function (data) {
    let data2 = []
    // Convert the data types from strings to numbers where appropriate
    data.forEach(function (d) {
        d.koi_prad = +d.koi_prad;
        d.koi_steff = +d.koi_steff;
        d.koi_insol = +d.koi_insol;

        if (d.koi_insol >= 0 && d.koi_insol <= 2)
            data2.push({ koi_steff: d.koi_steff, koi_insol: d.koi_insol, radius: d.koi_prad })
    });

    let xScale = d3
        .scaleLinear()
        .domain(
            d3.extent([2, 0])
        )
        .range([0, width]);

    let yScale = d3
        .scaleLinear()
        .domain(
            d3.extent(data2, function (d) {
                return d.koi_steff + 500;
            })
        )
        .range([height, 0]);

    let xAxis = d3
        .axisBottom(xScale)
        .tickSizeOuter(0)
        .tickPadding(10)
        .tickFormat(function (d) {
            // Check if the number is greater than or equal to 1
            if (d >= 1) {
                // If yes, return the number without the "m"
                return d;
            } else {
                // If not, return the number in scientific notation
                return d.toExponential(0);
            }
        });

    let yAxis = d3.axisLeft(yScale).tickSizeOuter(0).tickPadding(10);

    svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("dx", "-1.2em")
        .attr("dy", "-1.2em")
        .style("fill", "white")

    svg.selectAll(".x.axis path").style("stroke", "white");

    svg.selectAll(".x.axis line").style("stroke", "white");

    svg
        .append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        .style("fill", "white");

    svg.selectAll(".y.axis path").style("stroke", "white");

    svg.selectAll(".y.axis line").style("stroke", "white");


    svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(xAxis)

        .selectAll("text")

        .style("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("dx", "-1.2em")
        .attr("dy", "-1.2em")
        // make text transparent
        .style("opacity", "0")
        // make text transparent

        .style("fill", "white");
    svg.selectAll(".x.axis path").style("stroke", "white");
    svg.selectAll(".x.axis line").style("stroke", "white");

    svg
        .append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxis)

    svg.selectAll(".y.axis path").style("stroke", "white");
    svg.selectAll(".y.axis line").style("stroke", "white");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + "," + (height + margin.bottom - 40) + ")")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Insolation (Earth Flux)");

    // Add y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Temperature (Stellar Effective Temperature)");

    svg.append("line")
        .attr("x1", xScale(1.46))
        .attr("y1", height)
        .attr("x2", width)
        .attr("y2", yScale(6800))
        .style("stroke-width", 2)
        .style("stroke", "#ffbfc0")

    svg.append("line")
        .attr("x1", xScale(0.98))
        .attr("y1", height)
        .attr("x2", xScale(1.375))
        .attr("y2", 0)
        .style("stroke-width", 2)
        .style("stroke", "#bedec0")

    svg.append("line")
        .attr("x1", xScale(0.91))
        .attr("y1", height)
        .attr("x2", xScale(1.27))
        .attr("y2", 0)
        .style("stroke-width", 2)
        .style("stroke", "#97cb9a")

    svg.append("line")
        .attr("x1", xScale(0.81))
        .attr("y1", height)
        .attr("x2", xScale(1.1))
        .attr("y2", 0)
        .style("stroke-width", 2)
        .style("stroke", "#77bb7c")

    svg.append("line")
        .attr("x1", xScale(0.225))
        .attr("y1", height)
        .attr("x2", xScale(0.4))
        .attr("y2", 0)
        .style("stroke-width", 2)
        .style("stroke", "#5daf64")

    svg.append("line")
        .attr("x1", xScale(0.2))
        .attr("y1", height)
        .attr("x2", xScale(0.35))
        .attr("y2", 0)
        .style("stroke-width", 2)
        .style("stroke", "#c0bffd")

    let circles = svg.selectAll("circle").data(data2).enter().append("circle");
    circles
        .attr("cx", function (d) {
            return xScale(d.koi_insol);
        })
        .attr("cy", function (d) {
            return yScale(d.koi_steff);
        })
        .attr("r", function (d) {
            if (d.radius < 1)
                return 1
            else if (d.radius < 10)
                return d.radius
            else
                return 10
        })
        .attr("fill", function (d) {
            let P = { x: d.koi_insol, y: d.koi_steff };
            let A = { x: 1.46, y: 500 }
            let B = { x: 2, y: 6800 }
            let crossProduct = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);

            if (crossProduct < 0)
                return "#ffbfc0"
            else {
                A = { x: 0.98, y: 500 }
                B = { x: 1.375, y: 7200 }
                crossProduct = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
                if (crossProduct < 0)
                    return "#bedec0"
                else {
                    A = { x: 0.91, y: 500 }
                    B = { x: 1.27, y: 7200 }
                    crossProduct = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
                    if (crossProduct < 0)
                        return "#97cb9a"
                    else {
                        A = { x: 0.81, y: 500 }
                        B = { x: 1.1, y: 7200 }
                        crossProduct = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
                        if (crossProduct < 0)
                            return "#77bb7c"
                        else {
                            A = { x: 0.225, y: 500 }
                            B = { x: 0.4, y: 7200 }
                            crossProduct = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
                            if (crossProduct < 0)
                                return "#5daf64"
                            else {
                                A = { x: 0.2, y: 500 }
                                B = { x: 0.35, y: 7200 }
                                crossProduct = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
                                if (crossProduct < 0)
                                    return "#bedec0"
                                else
                                    return "#c0bffd"
                            }
                        }
                    }
                }
            }
        })



})