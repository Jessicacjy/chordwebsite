!function() {
var cnvChord = {
  version: "v1"
};


var DEBUG_ENABLED = true;
if(DEBUG_ENABLED && (typeof console != 'undefined')) {
  this.debug = console.log.bind(console);
}
else {
  this.debug = function(message) {};
}
var debug = this.debug;

var gRequest =   
{
  "data_url": null,
  "data": null,
};

//mainData, comp_sel = "2122",mtr_sel = "exist"
cnvChord.makeChord = function(params){


    let chartDims = params.chartDims;
    let mainData = params.mainData;
    let chart = params.chart;
    console.log(chartDims)


    let pullOutSize = 50;
    let opacityDefault = 0.6;
    let opacityLow = 0.05; 

    let outerRadius = Math.min(chartDims.width, chartDims.height) / 2  - 100;
    let innerRadius = outerRadius * 0.94;
    var clearClick = True;
    var toggleSelected = true;

    var respondents = 40361261, //Total number of respondents (i.e. the number that makes up the total group)
        emptyPerc = 0.4, //What % of the circle should become empty
        emptyStroke = Math.round(respondents*emptyPerc); 

    var offset = (2 * Math.PI) * (emptyStroke/(respondents + emptyStroke))/4;

    
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
    params = make_matrix(params,emptyPerc)                         


    function customSort(a,b) {
      return 1;
    };


    function make_matrix(params,emptyPerc){
      let col_name = []
      let row_name = []
    
      col_name = d3.nest().key(function(d){return d[params.gSecondary].value}).ontries(params.mainData)
      row_name = d3.nest().key(function(d){return d[params.gPrimary].value}).ontries(params.mainData)
      let col_num = col_name.length
    
      let row_num = row_name.length
    
      let emptyPerc = 0.4;
      let n = col_num + row_num + 2
      let name;
    
      console.log(col_name, row_num)
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
    
          var mtr = 0
          try{
            mtr = parseInt(data_sel[params.gMetric].value*100000);
            
            array_m_specific[j][n-2-i]= mtr;
            array_m_specific[n-2-i][j]= mtr;
            m_sum = m_sum + mtr;
           // console.log(m_sum)
          }
          catch(e){}
        }
      }   
      names=[];
    
      params.names = row_name.concat([""]).concat(col_name.reverse()).concat([''])
      
      var emptyStroke = parseInt(m_sum*emptyPerc);
      array_m_specific[row_num][n-1]  = emptyStroke;
      array_m_specific[n-1][row_num] = emptyStroke;
      params.matrix = array_m_specific;
      console.log(params)
      return params
    }
    var chord = customChordLayout() 
      .padding(.02)
      .sortChords(d3.descending)
      .sortSubgroups(d3.ascending()) 
      .matrix(matrix);
    
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
      //.on("mouseover", fade(opacityLow))
      //.on("mouseout", fade(opacityDefault));
        
  //   // Determine if current line is visible
  //      var active   = blueLine.active ? false : true,
  //     newOpacity = active ? 0 : 1;
  //   // Hide or show the elements
  //   d3.select("#blueLine").style("opacity", newOpacity);
  //   d3.select("#blueAxis").style("opacity", newOpacity);
  //   // Update whether or not the elements are active
  //   blueLine.active = active;
  // })
  //     .on("click", function(d){
  //       fade(opacityLow);
  //       console.log(toggleSelected)
  //       if(toggleSelected == true){
  //         fade_chord(opacityLow);
  //         toggleSelected = false;
  //       }else {
  //         fade(opacityDefault);
  //         toggleSelected = true;
    //    }
     // });


      console.log("check")
    g.append("path")
      .style("stroke", function(d,i) {return (Names[i] === "" ? "none" : fill[Names[i]]); })
      //.style("stroke", function(d,i) {return (Names[i] === "" ? "none" : "#00A1DE"); })    
      .style("fill", function(d,i) {
            if (Names[i] === ""){
              return "none"}
            else {
             return fill[Names[i]]}
             //return "#00A1DE"}
        })
      .style("pointer-events", function(d,i) { return (Names[i] === "" ? "none" : "auto"); })
      .attr("d", arc)
      .attr("transform", function(d, i) { //Pull the two slices apart
            d.pullOutSize = pullOutSize * ( d.startAngle + 0.001 > Math.PI ? -1 : 1);
            return "translate(" + d.pullOutSize + ',' + 0 + ")";
      });

    g.append("text")
      .each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + offset;})
      .attr("dy", ".35em")
        .style("font-size","9px")
      .attr("class", "titles")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d,i) { 
        var c = arc.centroid(d);
        return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
        + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
        + "translate(" + 20 + ",0)"
        + (d.angle > Math.PI ? "rotate(180)" : "")
      })
      .text(function(d,i) { return Names[i]; });

    g.append("text")
    .attr("class", "timeTitle")
    .attr("dx", -200)
    .attr("dy", -250)
    .text("Device Type")
    g.append("text")
    .attr("class", "timeTitle")
    .attr("dx", 140)
    .attr("dy", -250)
    .text("Age Range")

    var chords = wrapper.selectAll("path.chord")
      .data(chord.chords)
      .enter().append("path")
      .attr("class", "chord")
      .style("stroke", "none")
      .style("fill", function(d,i){
        //console.log(d.source)
        if (Names[d.source.index] === ""){
              return "none"}
            else {
             return fill[Names[d.target.index]]
             //return "#A1A1A1"
            }
            })
      .style("opacity", function(d) { return (Names[d.source.index] === "" ? 0 : opacityDefault); }) //Make the dummy strokes have a zero opacity (invisible)
      .style("pointer-events", function(d,i) { return (Names[d.source.index] === "" ? "none" : "auto"); }) //Remove pointer events from dummy strokes
      .attr("d", path)
      //.on("mouseover", fade_chord(opacityLow))
      //.on("mouseout", fade_chord(opacityDefault))
      .on("click", fade_chord(opacityLow))
      ; 
      console.log(chords.datum());
    //Arcs
    g.append("title") 
      .text(function(d, i) {return Names[i];});

    //Chords
    chords.append("title")
      .text(function(d) {
        //console.log(d)
        return ["From ", Names[d.target.index], " to ", Names[d.source.index],"; ", ": ", d.source.value].join(""); 
      });

    //Include the offset in de start and end angle to rotate the Chord diagram clockwise

    function startAngle(d) {
        //console.log(d); 
        return d.startAngle + offset; }

    function endAngle(d) {
        //console.log(d); 
        return d.endAngle + offset; 
    }

    function fade(opacity) {
      return function(d, i) {
      svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index !== i && d.target.index !== i &&  Names[d.source.index] !== ""; })
        .transition("fadeOnArc")
        .style("opacity", opacity);
      d3.event.stopPropagation();
    };}
    function reset_opacity(opacity){
      return function(d,i){
        svg.selectAll("path.chord")
        .transition()
        .style("opacity",opacity);
      }
    }

    function fade_chord(opacity) {
      return function() {
      svg.select("chord")
        .transition()
        .style("opacity", opacity);
    };}

    function drawLegend() {
      var legendDims = {
        "x": 30,
        "y": 10,
        // "y": diameter-100-60,
        "width": 100,
        "height": 12
      };}

  };

    //Function to clear circles
cnvChord.removeChord = function(chart) {
    
    console.log("removeBubbleChart: " + chart);

    d3.select(chart).selectAll('svg').remove();
    //d3.selectAll('.legend').remove();
    
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