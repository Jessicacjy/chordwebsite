var viz, sheet, table;
var filterName;
var click_count = 0;
var col_name = [];
var row_name = [];
var names = []
function initViz() {
    var containerDiv = document.getElementById("vizContainer"),
    url = "http://insights2.cnvrmedia.net/views/COREDiscoveryTag/DemographicHeatmap?:embed=yes";
    
    options = {

        // hideTabs: true,
        hideToolbar: true,
        onFirstInteractive: function() {
          getUnderlyingData()
          listenToFilterSelection()
          listenToMarksSelection() 
          listenToTabChange()
         //$('#vizContainer iframe').css( 'hidden');
           // document.getElementById('getData').disabled = false; // Enable our button
        }};
    viz = new tableau.Viz(containerDiv, url, options);
    table = getUnderlyingData();
    console.log(viz)         
}
function getUnderlyingData(){
  console.log(viz.getWorkbook().getActiveSheet().getWorksheets()[1])
  sheet = viz.getWorkbook().getActiveSheet().getWorksheets()[0];

      options = {

          maxRows: 0, // Max rows to return. Use 0 to return all rows
          ignoreAliases: false,
          ignoreSelection: true,
          includeAllColumns: true
      }
      sheet.getSummaryDataAsync(options).then(function(t,data){
          table = t;
          //var tgt = document.getElementById("dataTarget");
          data = table.getData() ;

          console.log("data",data)

          make_data_chord_dim(data)

      });
      
    }
//filtering
 function listenToFilterSelection() {
      viz.addEventListener(tableau.TableauEventName.FILTER_CHANGE, onFilterSelection);
  }
  function onFilterSelection(filterEvent) {
      click_count += 1;
      return filterEvent.getFilterAsync().then(reportSelectedFilter);
  }

  function reportSelectedFilter(marks) {
   //console.log("report selected filter")
      getUnderlyingData();
  }

function hasNumber(myString) {
   // console.log(/\d/.test(myString))
      return /\d/.test(myString);
    }
function make_data_chord_dim(data){

  //console.log("call_bar")
  col_name = []
  row_name = []

  let col_num = 3

  let row_num = data.length/col_num;

  let emptyPerc = 0.4;
  let n = col_num + row_num + 2
  let name;


  //console.log(data);
  for (var i = 0; i <= row_num-1; i++) {
   // console.log(data[i])
    row_name.push ( data[i*3][1].value)
  }
  for (var i = col_num-1; i >= 0; i--) {
    //console.log(col_num);
    col_name.push (data[i][3].value)
  }

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
          return d2[3]['value'] == col_name[i] && d2[1]['value'] == row_name[j];
       });

      var mtr = 0
      try{
        mtr = parseInt(data_sel[0][4].value*100000);
        
        array_m_specific[j][n-2-i]= mtr;
        array_m_specific[n-2-i][j]= mtr;
        m_sum = m_sum + mtr;
        console.log("sum",mtr, m_sum)
      }
      catch(e){}
    }
  }   
  names=[];

  names = row_name.concat([""]).concat(col_name.reverse()).concat([''])
  //console.log(names)

  var chordDims = {left: 4, top: 4, right: 4, bottom: 0, width: 800, height: 600}

  var emptyStroke = parseInt(m_sum*emptyPerc);
  array_m_specific[row_num][n-1]  = emptyStroke;
  array_m_specific[n-1][row_num] = emptyStroke;
  
  var fill = {"":"#ffffff",
        "Computer":"#977A46",
        "Mobile":"#403768",
        "Tablet":"#285E58"}
  var color_list = [
      "#EBEBEB",
      "#DFDFDF",
      "#D3D3D3",
      "#C7C7C7",
      "#BBBBBB",
      "#AFAFAF",
      "#A3A3A3",
      "#979797",
      "#8B8B8B",
      "#7F7F7F",
      "#737373"]
  for (var i = row_name.length - 2; i >= 0; i--) {
    if (row_name[i]){
      fill[row_name[i]] = color_list[i]
    }
  }

  var chordDims = {left: 4, top: 4, right: 4, bottom: 0, width: 800, height: 600}
  var paramsChord1 = {
        mainData: array_m_specific,
        chart: "#chord-1",
        chartDims: chordDims,
        names: names,
        fill:fill
      }
  cnvChord.makeChord(paramsChord1);

  //return array_m_specific.slice(0);
}


function listenToMarksSelection() {
    viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);
}
function listenToTabChange(){
  viz.addEventListener(tableau.TableauEventName.TAB_SWITCH,onTabSwitch)
}
function onMarksSelection(marksEvent) {
    //console.log("onMarksSelection")
    return marksEvent.getMarksAsync().then(reportSelectedMarks);
 }
function onTabSwitch(tabEvent){
  let prev_sheet = tabEvent.getOldSheetName()
  let new_sheet = tabEvent.getNewSheetName()
  if (prev_sheet == "Demographic Heatmap"){
    d3.select("#chord-1")
    .selectAll("*")
    .attr("display", "none")
  }
  if(new_sheet == "Demographic Heatmap"){
    d3.select("#chord-1")
    .selectAll("*")
    .attr("display", "block")
  }
  console.log("tab switch",tabEvent.getNewSheetName())

}
function reportSelectedMarks(marks) {
    var html = "<h4> You selected the following data points </h4>"; 

    
    let select_data = {}
    for (var markIndex = 0; markIndex < marks.length; markIndex++) {
        let select_single = {}
        var pairs = marks[markIndex].getPairs();
        html += "<br>"
        //console.log(markIndex)
        for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
            var pair = pairs[pairIndex];
            //console.log(pair.fieldName)
            select_single[pair.fieldName] = pair.value;
           // console.log(select_single);
            html += "<li><b>Field Name:</b> " + pair.fieldName;
           
        }
        //console.log(select_single)
        select_data[markIndex] = select_single;
        
    }
    //console.log(select_data);
    cnvChord.fade_chord_respond_to_tableau(select_data,names)
     var infoDiv = document.getElementById('markDetails');
     infoDiv.innerHTML = html;
}


function onChordSelection(source = null, target = null){
   
  if (source && target){
    //console.log(source);
    //console.log(target);
    sheet.selectMarksAsync({"Attribute Name": source,"Device / OS": target}, tableau.SelectionUpdateType.REPLACE)  
  }
 }
  function onGroupSelection(filterName){
    var allWorksheet = viz.getWorkbook().getActiveSheet().getWorksheets()
    //console.log(allWorksheet)
    viz.removeEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);


    for (var i = allWorksheet.length - 1; i >= 0; i--) {
      activeSheet = allWorksheet[i]
       if(col_name.includes(filterName)){
        console.log("device")
        activeSheet.selectMarksAsync("Device / OS", filterName, tableau.SelectionUpdateType.REPLACE)
      }
    else{

      activeSheet.selectMarksAsync("Attribute Name", filterName, tableau.SelectionUpdateType.REPLACE)
    }
    }
    setTimeout(function(){
       viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection)
    },2000)
   

  } 

function onChordClear(){
    //.log("clearselect")
    viz.revertAllAsync();
}


   