//using D3js
 $(document).ready(function () {
 <script type="text/javascript">
        d3.json("data.json", function (error, data) {

            var filledCount = data.filledCount;
            var totalorbitals = data.totalorbitals;
            var unfilledCount = totalorbitals - filledCount;
            var zoom;
            var margin = {
                top: 20,
                right: 20,
                bottom: 50,
                left: 50
            };

            var increments = data.increments;
            var interval = 100 / increments;
            var geometryIntervals = [100, 50, 25, 20, 10, 5, 4, 2];
            var orbitalList = getorbitalsList("Show All");
            var unfilledorbitalList = getunfilledorbitalsList("Show All");
            var completeOrbList = [];
            unfilledorbitalList.forEach(function (d) {
                completeOrbList.push(d);
            })
            orbitalList.forEach(function (d) {
                completeOrbList.push(d);
            })


            function geometryIntervalsData() {
                var filteredList = [];
                for (var i = 0; i < geometryIntervals.length; i++) {
                    if (geometryIntervals[i] <= data.increments) {
                        if (data.increments % geometryIntervals[i] == 0) {
                            filteredList.push(geometryIntervals[i]);
                        }
                    }
                }
                return filteredList;
            }

            function filledDropDownData() {
                var filledList = [];
                filledList.push("Select");
                if (filledCount <= 10) {
                    for (var i = 1; i < filledCount; i++) {

                        filledList.push(i);

                    }
                } else if (filledCount > 10) {
                    for (var i = 1; i <= 10; i++) {
                        filledList.push(i);
                    }
                    filledList.push("Show All");
                }
                return filledList;
            }

            function unfilledDropDownData() {
                var filledList = [];
                filledList.push("Select");
                if (unfilledCount <= 5) {
                    for (var i = 1; i <= unfilledCount - 1; i++) {
                        filledList.push(i);
                    }
                    filledList.push("Show All");
                } else if (unfilledCount > 5) {
                    for (var i = 1; i <= 5; i++) {
                        filledList.push(i);
                    }
                    filledList.push("Show All");
                }
                return filledList;
            }

            var svg;

            var geoInterval = d3.select("#geo")
            var filledUsed = d3.select("#filled")
            var unfilledUsed = d3.select("#unfilled")

            geoInterval
              .append("select")
              .selectAll("option")
              .data(geometryIntervalsData()).enter()
              .append('option')
              .text(function (d) {
                  return d;
              });

            filledUsed
              .append("select")
              .selectAll("option")
              .data(filledDropDownData()).enter()
              .append('option')
              .text(function (d) {
                  return d;
              });

            unfilledUsed
              .append("select")
              .selectAll("option")
              .data(unfilledDropDownData()).enter()
              .append('option')
              .text(function (d) {
                  return d;
              });

            geoInterval.on("change", function () {

                var selectedGeo = d3.select(this)
                  .select("select")
                  .property("value")
                increments = parseInt(selectedGeo);
                interval = 100 / increments;

                height = "";
                width = setWidth(increments);
                var updatednodes = updateNodes(data.nodes, interval, orbitalList, unfilledorbitalList);
                var updatedlinks = updateLinks(interval, orbitalList, unfilledorbitalList);
                d3.select('svg').selectAll("*").remove();
                drawOrbitalMapping(updatedlinks, updatednodes);

            });

            filledUsed.on("change", function () {

                var selectedValue = d3.select(this)
                  .select("select")
                  .property("value")

                orbitalList = getorbitalsList(selectedValue);

                var updatednodes = updateNodes(data.nodes, interval, orbitalList, unfilledorbitalList);
                var updatedlinks = updateLinks(interval, orbitalList, unfilledorbitalList);
              
                d3.select('svg').selectAll("*").remove();
                drawOrbitalMapping(updatedlinks, updatednodes);

            });

            unfilledUsed.on("change", function () {
                var selectedValue = d3.select(this)
                  .select("select")
                  .property("value")

                unfilledorbitalList = getunfilledorbitalsList(selectedValue);
                var updatednodes = updateNodes(data.nodes, interval, orbitalList, unfilledorbitalList);
                var updatedlinks = updateLinks(interval, orbitalList, unfilledorbitalList);
               
                d3.select('svg').selectAll("*").remove();
                drawOrbitalMapping(updatedlinks, updatednodes);
            });

            function getorbitalsList(selectedValue) {

                var totalorbDisplayCount;
                var orbital = filledCount;
                if (selectedValue == "Show All") {
                    totalorbDisplayCount = filledCount;
                } else {
                    totalorbDisplayCount = selectedValue;
                }
                var filledList = [];
                for (var i = 0; i < totalorbDisplayCount; i++) {
                    filledList.push(orbital);
                    //console.log(orbital.toString());
                    orbital = orbital - 1;
                }
                // console.log(filledList);
                return filledList;
            }

            function getunfilledorbitalsList(selectedValue) {

                var totalorbDisplayCount;
                var orbital = filledCount + 1;
                if (selectedValue == "Show All") {
                    totalorbDisplayCount = unfilledCount;
                } else {
                    totalorbDisplayCount = selectedValue;
                }
                var unfilledList = [];
                for (var i = 0; i < totalorbDisplayCount; i++) {
                    unfilledList.push(orbital);
                    //console.log(orbital.toString());
                    orbital = orbital + 1;
                }
                //console.log(filledList);
                return unfilledList;
            }

             width = 1500 - margin.left - margin.right;

            drawOrbitalMapping(data.links, data.nodes)

            function drawOrbitalMapping(links, nodes) {

                // width = 1800 - margin.left - margin.right;
                height = 1500 - margin.top - margin.bottom;

                height = (height / totalorbitals) * completeOrbList.length
                if (height < 500)
                    height = 500;

                var tickvalue = new Array();

                zoom = d3.zoom()
                  .scaleExtent([1, 40])
                  .translateExtent([
                    [-100, -100],
                    [width + 90, height + 50]
                  ])
                  .on("zoom", function () {
                      svg.attr("transform", d3.event.transform);
                  });

                svg = d3.select("svg").attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .call(zoom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var node, link;

                var x = d3.scaleLinear()
                  .range([0, width]);

                var y = d3.scaleLinear()
                  .range([height, 0]);

                var xAxis, yAxis;

                var i = 0;
                while (i <= 100) {
                    tickvalue.push(i);
                    i = i + (interval);
                }

                xAxis = d3.axisBottom()
                  .scale(x)
                  .tickValues(tickvalue)
                  .tickPadding(10)

                yAxis = d3.axisLeft()
                  .scale(y)
                  .tickValues(completeOrbList)
                  .tickSize(5, 5)
                  .tickFormat(d3.format('.0f'))

                var startindex = -1 * (interval);

                x.domain([startindex, (100 - 2 * startindex)]);
                y.domain([d3.min(completeOrbList) - 1, d3.max(completeOrbList) + 1])

                var gX = svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis)

                svg.append("text")
                  .attr("transform",
                    "translate(" + (width / 2) + " ," +
                    (height + margin.top + 25) + ")")
                  .style("text-anchor", "middle")
                  .text("Reaction Path Geometries (%)");


                var gY = svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)

                svg.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 0 - margin.left)
                  .attr("x", 0 - (3 * height / 4))
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text("Orbitals");

                svg.append('defs').append('marker')
                  .attrs({
                      'id': 'arrowhead',
                      'viewBox': '-0 -5 10 10',
                      'refX': 23,
                      'refY': 0,
                      'orient': 'auto',
                      'markerWidth': 6,
                      'markerHeight': 6,
                      'xoverflow': 'visible'
                  })
                  .append('svg:path')
                  .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                  .attr('fill', '#0066cc')
                  .style('stroke', 'none');

                svg.append('defs').append('marker')
                  .attrs({
                      'id': 'arrowheadunfilled',
                      'viewBox': '-0 -5 10 10',
                      'refX': 23,
                      'refY': 0,
                      'orient': 'auto',
                      'markerWidth': 6,
                      'markerHeight': 6,
                      'xoverflow': 'visible'
                  })
                  .append('svg:path')
                  .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                  .attr('fill', '#cc0000')
                  .style('stroke', 'none');

                var simulation = d3.forceSimulation()
                  .force("link", d3.forceLink().id(function (d) {
                      return d.id;
                  }).distance(100).strength(1))
                  .force("charge", d3.forceManyBody())
                  .force("center", d3.forceCenter(width / 2, height / 2));

                var div = d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

                link = svg.selectAll(".link")
                  .data(links)
                  .enter()
                  .append("line")
                  .attr("class", "link")
                  .style('stroke', function (d) {
                      if (d.type == "unfilled") {
                          return '#cc0000'
                      } else {
                          return '#0066cc'
                      };
                  })
                  .attr('marker-end', function (d) {
                      if (d.type == "unfilled") {
                          return 'url(#arrowheadunfilled)'
                      } else {
                          return 'url(#arrowhead)'
                      };
                  })
                  .on("mouseover", function (d) {
                      d3.select(this)
                                   .attr("stroke-width", 4)
                      if (!(d3.format(",.4f")(d.lvalue) == "NaN")) {

                          div.transition()
                          .style("opacity", .9);
                          div.html(d3.format(",.4f")(d.lvalue) + "<br/>")
                          .style("left", (d3.event.pageX) + "px")
                         .style("top", (d3.event.pageY - 28) + "px");
                          d3.select(this)
                          .attr("stroke-width", 9)
                      }
                  })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

                node = svg.selectAll(".node")
                  .data(nodes)
                  .enter()
                  .append("g")
                  .attr("class", "node")

                node.append("circle")
                  .attr("r", 12)
                  .attr("cx", function (d) {
                      return x((d.id).substr(0, (d.id).indexOf("-")));
                  })
                  .attr("cy", function (d) {
                      return y((d.id).substr((d.id).indexOf("-") + 1, (d.id).length));
                  })
                  .style('fill', function (d) {
                      return '#ffffff';
                  })


                node.append("text")
                  .attr("x", function (d) {
                      return x((d.id).substr(0, (d.id).indexOf("-")));
                  })
                  .attr("y", function (d) {
                      return y((d.id).substr((d.id).indexOf("-") + 1, (d.id).length)) + 5;
                  })
                  .text(function (d) {
                      return (d.id).substr((d.id).indexOf("-") + 1, (d.id).length)
                  })
                  .attr("text-anchor", "middle");
                
                simulation
                  .nodes(nodes)
                  .on("tick", ticked);
                simulation.force("link")
                  .links(links);


                var adjust_y = function (d) {
                    return y((d.id).substr((d.id).indexOf("-") + 1, (d.id).length));
                };

                var adjust_x = function (d) {
                    return x((d.id).substr(0, (d.id).indexOf("-")));
                };


                function ticked() {
                    link.attr("x1", function (d) {
                        return adjust_x(d.source);
                    })
                      .attr("y1", function (d) {
                          return adjust_y(d.source);
                      })
                      .attr("x2", function (d) {
                          return adjust_x(d.target);
                      })
                      .attr("y2", function (d) {
                          return adjust_y(d.target);
                      });
                }
            }

            function updateNodes(nodes, interval, orbitalList, unfilledorbitalList) {
                var nodelist = [];
                var orblist = [];
                completeOrbList = [];

                unfilledorbitalList.forEach(function (d) {
                    completeOrbList.push(d);
                })
                orbitalList.forEach(function (d) {
                    completeOrbList.push(d);
                })

                nodes.forEach(function (d) {
                    var x = (d.id).substr(0, (d.id).indexOf("-"));
                    var y = (d.id).substr((d.id).indexOf("-") + 1);

                    if ((completeOrbList.includes(parseInt(y))) && (x % interval == 0)) {
                        nodelist.push({
                            id: d.id
                        });
                    }
                });
                return nodelist;
            }

            function updateLinks(interval, orbitalList, unfilledorbitalList) {
                var filteredlinks = [];
                var orblist = [];
                completeOrbList = [];

                unfilledorbitalList.forEach(function (d) {
                    completeOrbList.push(d);
                })
                orbitalList.forEach(function (d) {
                    completeOrbList.push(d);
                })

                var source;
                var target;
                data.linkers.forEach(function (linker) {
                    for (i = 0; i < linker.ids.length; i++) {

                        var item = linker.ids[i].substring(0, linker.ids[i].indexOf("-"));
                        var y = linker.ids[i].substring(linker.ids[i].indexOf("-") + 1);

                        if (item == "0") {

                            source = linker.ids[i];
                        } else if (parseInt(item) % interval == 0) {
                            target = linker.ids[i];
                            filteredlinks.push({
                                source: source,
                                target: target,
                                type: linker.type
                            });
                            source = target;
                        }
                    }
                })

                filteredlinks = filteredlinks.filter(function (d) {
                    var s = (d.source).substring((d.source).indexOf("-") + 1);
                    var t = (d.target).substring((d.target).indexOf("-") + 1);
                    if (completeOrbList.includes(parseInt(s)) && completeOrbList.includes(parseInt(t)))
                        return d
                })
                return filteredlinks;
            }
            d3.select("button")
              .on("click", resetted);

            function resetted() {
                svg.transition()
                  //.duration(750)
                  .call(zoom.transform, d3.zoomIdentity);
            }
        })
}
