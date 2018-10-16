'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  // Use the jQuery document ready signal to know when everything has been initialized
  $(document).ready(function () {
    // Tell Tableau we'd like to initialize our extension
    tableau.extensions.initializeAsync().then(function () {
      // Once the extension is initialized, ask the user to choose a sheet
      // showChooseSheetDialog();
      const worksheetName = "Device Usage By Demo";
      loadSelectedMarks (worksheetName);
      $('#selected_marks_title').text(worksheetName);
      // initializeButtons();
    });
  });



  // This variable will save off the function we can call to unregister listening to marks-selected events
  let unregisterEventHandlerFunction;

  //get All the underlying Data from the worksheet
  function getUnderlyingData(worksheetName){
    let options = {

      maxRows: 0, // Max rows to return. Use 0 to return all rows
      ignoreAliases: false,
      ignoreSelection: true,
      includeAllColumns: true
    }
    if (unregisterEventHandlerFunction) {
      unregisterEventHandlerFunction();
    }

    // Get the worksheet object we want to get the selected marks for
    const worksheet = getSelectedSheet(worksheetName);

    console.log(worksheet)
    var worksheetData = worksheet.getSummaryDataAsync(options).then(function(t,data){

      console.log("t", t)
      let _data = t.data
      let _column = t.columns
      console.log(_data)
      console.log(_column)
      const columns = _column.map(function (column) {
        return column.fieldName;
      });
      const newdata = _data.map(function (row, index) {
        const rowData = row.map(function (cell,i) {

          return  {title: columns[i], value: cell.formattedValue};
        });
        return rowData;
      });
      console.log("data", newdata)
     
      console.log("col",columns)

      make_data_chord_dim(newdata) 

  });

  }

  function make_data_chord_dim(data){
    var paramsChord;

    var chordDims = {left: 4, top: 4, right: 4, bottom: 0, width: 800, height: 600}
    var paramsChord = {
          mainData: data,
          chart: "#chord-1",
          chartDims: chordDims,
          gPrimary: 1,//left categories
          gSecondary: 3, //right categories
          gMetric:4
        }
    console.log(paramsChord)


    
    cnvChord.makeChord(paramsChord);

  }

  function loadSelectedMarks (worksheetName) {
    // Remove any existing event listeners
    const worksheet = getSelectedSheet(worksheetName);
    getUnderlyingData(worksheetName)
 
    // Call to get the selected marks for our sheet
    worksheet.getSelectedMarksAsync().then(function (marks) {
      // Get the first DataTable for our selected marks (usually there is just one)
      const worksheetData = marks.data[0];

      // Map our data into the format which the data table component expects it
      const data = worksheetData.data.map(function (row, index) {
        const rowData = row.map(function (cell) {
          return cell.formattedValue;
        });

        return rowData;
      });

      

      // Populate the data table with the rows and columns we just pulled out
      populateDataTable(data, columns);
    });

    // Add an event listener for the selection changed event on this sheet.
    unregisterEventHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
      // When the selection changes, reload the data
      loadSelectedMarks(worksheetName);
    });
  }

  function populateDataTable (data, columns) {
    // Do some UI setup here to change the visible section and reinitialize the table
    $('#data_table_wrapper').empty();

    if (data.length > 0) {
      $('#no_data_message').css('display', 'none');
      $('#data_table_wrapper').append(`<table id='data_table' class='table table-striped table-bordered'></table>`);

      // Do some math to compute the height we want the data table to be
      var top = $('#data_table_wrapper')[0].getBoundingClientRect().top;
      var height = $(document).height() - top - 130;

      // Initialize our data table with what we just gathered
      $('#data_table').DataTable({
        data: data,
        columns: columns,
        autoWidth: false,
        deferRender: true,
        scroller: true,
        scrollY: height,
        scrollX: true,
        dom: "<'row'<'col-sm-6'i><'col-sm-6'f>><'row'<'col-sm-12'tr>>" // Do some custom styling
      });
    } else {
      // If we didn't get any rows back, there must be no marks selected
      $('#no_data_message').css('display', 'inline');
    }
  }


  function getSelectedSheet (worksheetName) {
    // Go through all the worksheets in the dashboard and find the one we want
    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }
})();
