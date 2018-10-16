! function () {
  var cnvChord = {
    version: "v1"
  };


  var DEBUG_ENABLED = true;
  if (DEBUG_ENABLED && (typeof console != 'undefined')) {
    this.debug = console.log.bind(console);
  } else {
    this.debug = function (message) {};
  }
  var debug = this.debug;

  var gRequest = {
    "data_url": null,
    "data": null,
  };

  //mainData, comp_sel = "2122",mtr_sel = "exist"
  cnvChord.makeChord = function (params) {
    params = make_matrix(params,0.4) 
    let chartDims = params.chartDims;
    let mainData = params.mainData;
    let chart = params.chart;
    var matrix = params.matrix;
    var Names = params.names;
    var color = "schemeCategory20b"
    var fill = d3.scaleOrdinal(d3[color])
    var emptyStroke = params.emptyStroke
    console.log(params)


    let pullOutSize = 50;
    let opacityDefault = 0.6;
    let opacityLow = 0.05; 

    let outerRadius = Math.min(chartDims.width, chartDims.height) / 2  - 80;
    let innerRadius = outerRadius * 0.92;
    var clearClick = true;
    var toggleSelected = true;
    var respondents = 4
    var offset = (2 * Math.PI) * (respondents * 0.4/(respondents + 0.4))/4;

    d3.select("#chord-1").selectAll("svg").remove();
    var svg = d3.select("#chord-1")
        .append("svg")
        // .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("width", chartDims.width + chartDims.left + chartDims.right)
        .attr("height", chartDims.height + chartDims.top + chartDims.bottom)
        // .classed("svg-content-responsive", true);
    var rectangle = svg.append("rect")
                             .attr("x", 10)
                             .attr("y", 10)
                            .attr("width", chartDims.width + chartDims.left + chartDims.right)
                            .attr("height", chartDims.height + chartDims.top + chartDims.bottom)
                            .attr("fill", "transparent")
                            .on("click", function(){
                              reset_opacity(opacityDefault)
                              clearClick = true});
    var wrapper = svg.append("g").attr("class", "chordWrapper")
      .attr("transform", "translate(" + (chartDims.width / 2 + chartDims.left) 
            + "," + (chartDims.height / 2 + chartDims.top) + ")");


    function customSort(a,b) {
      return 1;
    };


    function make_matrix(params,emptyPerc){
      let col_name = []
      let row_name = []
    
      
      col_name = [...new Set(params.mainData.map(function(d){
        return d[params.gSecondary].value}))
      ]
      row_name = [...new Set(params.mainData.map(function(d){
        return d[params.gPrimary].value}))
      ]
      let col_num = col_name.length
    
      let row_num = row_name.length
    
      let n = col_num + row_num + 2
      let name;
      let data = params.mainData
      console.log(col_name, row_name)
      var array_m_specific = [];
      for(var i = 0; i < n; ++i) {
    
          array_m_specific[i] = [ ];
          for(var j = 0; j < n; ++j) {
              array_m_specific[i][j] = 0; // a[i] is now an array so this works.
          }
      }
      //console.log(array_m_specific)
      var m_sum  = 0;
      
      for (var i = 0; i < col_num ; i++){
        for (var j = 0; j<row_num; j++) {
          var data_sel = data.filter(function(d2){
           
              return d2[params.gSecondary].value == col_name[i] && d2[params.gPrimary].value == row_name[j];
           });
           
           try{
            
            let mtr = parseFloat(data_sel[0][params.gMetric].value);
            array_m_specific[row_num + i + 1][j] = mtr;
            array_m_specific[j][row_num + i + 1] = mtr;
            m_sum = m_sum + mtr;
           //console.log(m_sum)
          }
          catch(e){}
        }
      }   
      params.names = row_name.concat("").concat(col_name).concat("")
      console.log(m_sum, emptyPerc)
      var emptyStroke = parseInt(m_sum*emptyPerc);
      array_m_specific[row_num][n-1]  = emptyStroke;
      array_m_specific[n-1][row_num] = emptyStroke;
      console.log(array_m_specific)
      params.matrix = array_m_specific;
     
      return params
    }
    var clearClick = true;
    d3.select("#chord-1").selectAll("svg").remove();


    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
    var svg = d3.select("#chord-1")
      .append("svg")
      // .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("width", chartDims.width + chartDims.left + chartDims.right)
      .attr("height", chartDims.height + chartDims.top + chartDims.bottom)
    // .classed("svg-content-responsive", true);

    var rectangle = svg.append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", chartDims.width + chartDims.left + chartDims.right)
      .attr("height", chartDims.height + chartDims.top + chartDims.bottom)
      .attr("fill", "transparent")
      .on("click", function () {
        reset_all();
        console.log("clicked rectangle")
      });

    var wrapper = svg.append("g")
      .attr("class", "chordWrapper")
      .attr("transform", "translate(" + (chartDims.width / 2 + chartDims.left) +
        "," + (chartDims.height / 2 + chartDims.top) + ")");


    function customSort(a, b) {
      return 1;
    };

    var chord = customChordLayout()
      .padding(.02)
      .sortChords(d3.descending)
      .sortSubgroups(d3.ascending())
      .matrix(matrix);
    // console.log(matrix)
    var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle);

    var path = stretchedChord()
      .radius(innerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .pullOutSize(pullOutSize);


    wrapper.selectAll("g").remove()

    var g = wrapper.selectAll("g.group")
      .data(chord.groups)
      .enter().append("g")
      .attr("class", "group")

      .on("click", fade(opacityLow))


    var groupPath = g.append("path")
      .attr("id", function (d, i) {
        return "group " + Names[i];
      })
      .style("stroke", function (d, i) {
        return (Names[i] === "" ? "none" : fill[Names[i]]);
      })
      //.style("stroke", function(d,i) {return (Names[i] === "" ? "none" : "#00A1DE"); })    
      .style("fill", function (d, i) {
        if (Names[i] === "") {
          return "none"
        } else {
          return fill(i)
        }
        //return "#00A1DE"}
      })
      .style("pointer-events", function (d, i) {
        return (Names[i] === "" ? "none" : "auto");
      })
      .attr("d", arc)
      .attr("transform", function (d, i) { //Pull the two slices apart
        d.pullOutSize = pullOutSize * (d.startAngle + 0.001 > Math.PI ? -1 : 1);
        return "translate(" + d.pullOutSize + ',' + 0 + ")";
      })

    var groupText = g.append("text")
      .attr("x", 10)
      .attr("dy", 10)
    //.style("opacity",0.8);

    groupText.append("textPath")
      .attr("class", "textpath")
      .attr("xlink:href", function (d, i) {
        return "#group " + Names[i];
      })
      .text(function (d, i) {
        if ((d.value / 1000) > 10) {
          return Math.round(d.value / 100) / 10 + "%";
        };
      })
      .attr("dy", ".35em")
      .style("fill", "#ffffff")
      .style("font-size", "10px");


    //Side Titles
    g.append("text")
      .attr("dy", ".15em")
      .style("font-size", "9px")
      .style("fill", "#232323")
      .each(function (d) {
        d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
      })

      .attr("class", "titles")
      .attr("text-anchor", function (d) {
        return d.angle > Math.PI ? "end" : null;
      })
      .attr("transform", function (d, i) {
        var c = arc.centroid(d);
        return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")" +
          "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
          "translate(" + 18 + ",0)" +
          (d.angle > Math.PI ? "rotate(90)" : "rotate(90)")
      })
      .text(function (d, i) {
        return Names[i]
      })

    ;


    g.append("text")
      .attr("class", "timeTitle")
      .attr("dx", -140)
      .attr("dy", -250)
      .text("Device/OS") //add Device Type
    g.append("text")
      .attr("class", "timeTitle")
      .attr("dx", 80)
      .attr("dy", -250)
      .text("Attributes")
    ///add Age Range
    console.log("render here")
    var chords = wrapper.selectAll("path.chord")
      .data(chord.chords)
      .enter().append("path")
      .attr("class", "chord")
      .style("stroke", "none")
      .style("fill", function (d, i) {
        //console.log(d.source)
        if (Names[d.source.index] === "") {
          return "none"
        } else {
          console.log(fill[2])
          return fill(Names[d.target.index])
          //return "#A1A1A1"
        }
      })
      .style("opacity", function (d) {
        return (Names[d.source.index] === "" ? 0 : opacityDefault);
      }) //Make the dummy strokes have a zero opacity (invisible)
      .style("pointer-events", function (d, i) {
        return (Names[d.source.index] === "" ? "none" : "auto");
      }) //Remove pointer events from dummy strokes
      .attr("d", path)
      .on("click", fade_chord(opacityLow));
    //console.log(chords.datum());
    //Arcs
    g.append("title")
      .text(function (d, i) {
        return Names[i] + ": " + Math.round(d.value / 100) / 10 + "%"
      });

    //Chords
    chords.append("title")
      .text(function (d) {
        //console.log(d)
        return ["From ", Names[d.target.index], " to ", Names[d.source.index], "; ", ": ", d.source.value].join("");
      });

    chords.append("attr")
      .on("click", function (d) {
        fade_chord(opacityLow)
      })


    //Include the offset in de start and end angle to rotate the Chord diagram clockwise

    function startAngle(d) {
      //console.log(d); 
      return d.startAngle + offset;
    }

    function endAngle(d) {
      //console.log(d); 
      return d.endAngle + offset;
    }

    var t = d3.transition()
      .duration(750)
      .ease(d3.easeLinear);

    function fade(opacity) {
      //console.log("fade function")
      return function (d, i) {
        filter_n = Names[d.index]
        //console.log(filter_n)

        reset_opacity();
        onGroupSelection(filterName = filter_n);

        svg.selectAll("path.chord")
          .filter(function (d) {
            return d.source.index !== i && d.target.index !== i && Names[d.source.index] !== "";
          })
          .transition()
          .duration(400)
          .style("opacity", opacity);

      };
    }

    function fade_mouseover(opacity) {
      //console.log("mouseover fade function")
      return function (d, i) {
        filterName = Names[d.index]

        reset_opacity();
        //onChordSelection(filterName = filterName);
        //console.log(d)
        svg.selectAll("path.chord")
          .filter(function (d) {
            return d.source.index !== i && d.target.index !== i && Names[d.source.index] !== "";
          })
          .transition()
          .duration(400)
          .style("opacity", opacity);

      };
    }

    function reset_opacity() {
      //console.log("reset_opacity");
      svg.selectAll("path.chord")
        .transition()
        .duration(400)
        .style("opacity", opacityDefault);

    }


    function reset_all() {
      console.log("reset_opacity");
      // onChordClear();
      svg.selectAll("path.chord")
        .transition()
        .duration(400)
        .style("opacity", opacityDefault);
    }

    function fade_chord(opacity) {

      return function (d2, i) {
        let source = Names[d2.source.index];
        let target = Names[d2.target.index];
        //console.log(source, target)
        onChordSelection(source, target);
        //console.log("fade_chordfunction")
        reset_opacity()
        svg.selectAll("path.chord")
          .filter(function (d) {
            //console.log(d) ;
            return d.source.index != d2.source.index ||
              d.target.index != d2.target.index &&
              Names[d.source.index] != "";
          })
          .transition()
          .duration(400)
          .style("opacity", opacity);

      };
    }



    function drawLegend() {
      var legendDims = {
        "x": 30,
        "y": 10,
        // "y": diameter-100-60,
        "width": 100,
        "height": 12
      };
    }
  };

  cnvChord.fade_chord_respond_to_tableau = function (marks, names) {
    //console.log("fade_chord_tableau")
    let opacityDefault = 0.6;
    let opacityLow = 0.05;

    if (Object.keys(marks).length == 0) {
      // if(keys(marks).length === 0){
      //console.log(names)
      d3.selectAll("path.chord")
        .style("opacity", opacityDefault)
    } else {
      let target_id, source_id
      d3.selectAll("path.chord")
        .style("opacity", opacityLow)
      d3.selectAll("path.chord")
        .filter(function (d) {
          for (var mark in marks) {
            try {
              let source = marks[mark]["Attribute Name"]
              source_id = names.indexOf(String(source))
            } catch (err) {
              source_id = -1
            }
            try {
              let target = marks[mark]["Device / OS"]
              target_id = names.indexOf(String(target))
            } catch (err) {
              target_id = -1
            }
            //console.log(source_id, target_id)
            if (source_id == -1 && target_id != -1) {
              if (d.target.index == target_id) {
                return d
              }
            } else if (target_id == -1 && source_id != -1) {
              //console.log(d.source.index)
              if (d.source.index == source_id) {

                return d
              }
            } else if (target_id == -1 && source_id == -1) {
              return d
            } else {
              if (d.source.index == source_id && d.target.index == target_id) {
                //console.log("print d")
                // console.log(d)
                return d
              }
            }

          }
        })
        .transition()
        .duration(400)
        .style("opacity", opacityDefault);
    }
    //Function to clear circles
  }

  // ======== Module/Export Functions ========
  // ======== Module/Export Functions ========
  // ======== Module/Export Functions ========
  if (typeof define === "function" && define.amd)
    define(cnvChord);
  else if (typeof module === "object" && module.exports)
    module.exports = cnvChord;
  this.cnvChord = cnvChord;
}();