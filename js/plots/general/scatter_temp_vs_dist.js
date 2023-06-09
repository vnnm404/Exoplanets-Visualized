const margin = { top: 20, right: 30, bottom: 100, left: 80 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Load the data from the CSV file
d3.csv("/data/Exoplanets_v1.csv").then(function (data2) {
  data2.push({ 'pl_orbsmax': 0.0252, 'st_teff': 3600, 'pl_rade': 1.0161, "pl_name": 'Teegardens Star b' })
  data2.push({ 'pl_orbsmax': 1, 'st_teff': 5900, 'pl_rade': 1, "pl_name": 'Earth' })

  // Convert the data types from strings to numbers where appropriate
  data2.forEach(function (d) {
    d.sy_snum = +d.sy_snum;
    d.sy_pnum = +d.sy_pnum;
    d.sy_mnum = +d.sy_mnum;
    d.disc_year = +d.disc_year;
    d.pl_orbper = +d.pl_orbper;
    d.pl_orbsmax = +d.pl_orbsmax;
    d.pl_rade = +d.pl_rade;
    d.pl_masse = +d.pl_masse;
    d.pl_dens = +d.pl_dens;
    d.pl_eqt = +d.pl_eqt;
    d.st_teff = +d.st_teff;
    d.st_logg = +d.st_logg;
    d.sy_dist = +d.sy_dist;
  });

  const data = Object.values(
    data2
      .filter((d) => {
        return d.st_teff && d.pl_orbsmax && d.pl_rade;
      })
      .reduce((c, e) => {
        if (!c[e.pl_name]) c[e.pl_name] = e;
        return c;
      }, {})
  );

  // Define the scales for the x and y axes
  var xScale = d3
    .scaleLog()
    .domain(
      d3.extent(data, function (d) {
        return d.pl_orbsmax;
      })
    )
    .range([0, width]);

  var yScale = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return d.st_teff;
      })
    )
    .range([height, 0]);

  // Define the x and y axes
  var xAxis = d3
    .axisBottom(xScale)
    .tickSizeOuter(0)
    .tickPadding(10)
    .tickFormat(function (d) {
      return d;
    });

  var yAxis = d3.axisLeft(yScale).tickSizeOuter(0).tickPadding(10);

  // Define the habitable planet region
  var habitableMinTemp = 273; // K
  var habitableMaxTemp = 6000; // K
  var habitableMaxDist = 1; // AU

  // Create the SVG container and add the axes
  var svg = d3
    .select("#general_plots")
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
    .style("fill", "white");

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

  // Bind the data to a selection of circles
  var circles = svg.selectAll("circle").data(data).enter().append("circle");

  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width / 2)
    .attr("y", height + 35 + 20)
    .text("Distance in AU")
    .style("fill", "white");

  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -45)
    .attr("x", -height / 2)
    .attr("transform", "rotate(-90)")
    .text("Temperature")
    .style("fill", "white");

  // Set the position and size attributes based on the data
  circles
    .attr("cx", function (d) {
      return xScale(d.pl_orbsmax);
    })
    .attr("cy", function (d) {
      return yScale(d.st_teff);
    })
    .attr("r", function (d) {
      if (d.pl_name == 'Teegardens Star b' || d.pl_name == 'Earth')
        return 8
      else
        return d.pl_rade / 1.8 || 3 / 1.8;
    })
    .attr("id", (d) => `stdplot_${d.loc_rowid}`)
    .style("fill", function (d) {
      if (d.pl_name == 'Teegardens Star b')
        return "blue"
      else if (d.pl_name == 'Earth')
        return "white"
      else
        return "none"
    }) // set a default radius of 3 if pl_rade is missing
    .style("stroke", function (d) {
      if (d.pl_name == 'Teegardens Star b')
        return "blue";
      else if (d.pl_name == 'Earth')
        return "white";
      else if (
        d.st_teff >= habitableMinTemp &&
        d.st_teff <= habitableMaxTemp &&
        d.pl_orbsmax <= habitableMaxDist
      ) {
        return "green"; // habitable planet
      } else {
        return "red"; // non-habitable planet
      }
    })
    .on("load", function (d) {
      $(`#stdplot_${d.loc_rowid}`).qtip({
        content: d.pl_name + ", temp: " + d.st_teff + ", distance: " + d.pl_orbsmax + " AU",
        position: {
          my: "bottom left",
          at: "right center",
          target: "mouse",
        },
        style: {
          classes: "qtip-dark",
        },
      });
    })
    .on("mouseover", function (event, d) {
      let matrix = this.getScreenCTM().translate(
        +this.getAttribute("cx"),
        +this.getAttribute("cy")
      );

      tooltip
        .html(
          "<b>" + d.pl_name + "</b><br/>" +
          "Temp: " + d.st_teff + " K<br/>" +
          "Distance: " + d.pl_orbsmax + " AU"
        )
        .style("opacity", 1)
        .style("left", window.pageXOffset + matrix.e + 15 + "px")
        .style("top", window.pageYOffset + matrix.f - 30 + "px");

      if (d.pl_name == 'Teegardens Star b' || d.pl_name == 'Earth') {
        d3.select(this).transition().duration(100).attr("r", 12);
        d3.select(this).style("fill", "lightblue");
        d3.select(this).style("stroke", "lightblue");
      }
      else if (
        d.st_teff >= habitableMinTemp &&
        d.st_teff <= habitableMaxTemp &&
        d.pl_orbsmax <= habitableMaxDist
      ) {
        d3.select(this).style("fill", "green");
      } else {
        d3.select(this).style("fill", "red");
      }
    })
    .on("mouseout", function (event, d) {
      tooltip.style("opacity", 0);
      if (d.pl_name == 'Teegardens Star b') {
        d3.select(this).transition().duration(100).attr("r", 8);
        d3.select(this).style("fill", "blue");
        d3.select(this).style("stroke", "blue");
      }
      else if (d.pl_name == 'Earth') {
        d3.select(this).transition().duration(100).attr("r", 8);
        d3.select(this).style("fill", "white");
        d3.select(this).style("stroke", "white");
      }
      else {
        d3.select(this).style("fill", "none");
      }
    });

  svg
    .append("line")
    .attr("class", "habitable-line")
    .attr("x1", xScale(0))
    .attr("y1", yScale(habitableMinTemp))
    .attr("x2", xScale(habitableMaxDist))
    .attr("y2", yScale(habitableMinTemp))
    .style("stroke", "white");

  svg
    .append("line")
    .attr("class", "habitable-line")
    .attr("x1", xScale(habitableMaxDist))
    .attr("y1", yScale(habitableMinTemp))
    .attr("x2", xScale(habitableMaxDist))
    .attr("y2", yScale(habitableMaxTemp));
  // .style("stroke", "white")
}); // End of data loading
