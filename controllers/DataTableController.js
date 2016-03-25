function DataTableController(dom, passedHeaders, databaseController) {
  if (typeof dom !== 'object' || typeof passedHeaders !== 'object' || typeof databaseController !== 'object') {
    console.log(arguments);
    throw new Error('Mising construction parameters!');
  }
  
  
  //  --- PUBLIC FUNCTIONS ---
  
  //  ==========================
  //  ADD ALL ROWS
  //  ==========================
  this.addAllRows = function(entryArray) {
    var that = this;
    entryArray.forEach( function(entry) {
      that.addRow(entry);
    });
  };
  
  
  //  ==========================
  //  ADD ROW
  //  ==========================
  this.addRow =  function(entry) {
    if (!entry) {
      throw new Error('Missing entry!');
    }
    var newRow = this.dom.insertRow();
    var that = this;
    
    newRow.setAttribute('id', entry.id);
    
    this.headers.forEach(function(columnName) {
      var cellText = formatText(entry[columnName], columnName);
      var newCell = createCell(cellText, columnName);
      
      newRow.appendChild(newCell);
    });
  };
  
  
  //  ==========================
  //  FILTER ROWS
  //  ==========================
  this.filterRows = function(filterTo, columnIndex, createButton) {
    var that = this;
    
    function showButton(index) {
      // display the reset button
      that.dom.rows[0].cells[index].innerHTML = '<button id="dataTableShowAll">' +
      'Reset' +
      '</button>';
      that.dom.rows[0].cells[index].children[0].addEventListener('click', function dataTableResetButtonClick(event) {
        event.target.parentNode.innerHTML = headerCell.innerHTML;
        that.showAllRows.call(that);
      });
    }
    
    if (columnIndex < 0 || typeof filterTo !== 'string') {
      throw new Error('Parameters passed to filter function are invalid.');
    }
    
    var headerCell = this.dom.rows[0].cells[columnIndex];
    var currentCategory = headerCell.innerHTML;
    console.log(currentCategory);
    if (currentCategory.substr(0, 7) === '<button') {
      console.log('This column has already been filtered.');
      return false;
    }
    
    
    console.log('Filtering', currentCategory, 'to', filterTo);
    displayHeaders.call(this);
    
    // Hide all the non-matching rows
    for (var i = 1, row; row = this.dom.rows[i]; i++) {
      var cellContent = row.cells[columnIndex].innerHTML;
      
      if (row.id !== 'headerRow' && cellContent !== filterTo) {
        // if we're filtering in the Date column, filter to the month, not exact day
        if (currentCategory === 'Date') {
          if (cellContent.substr(0,3) !== searchText.substr(0,3) && cellContent.substr(cellContent.length-4) === filterTo.substr(filterTo.length-4)) {  
            row.setAttribute('style', 'display:none;');
          }
        }
        
        else {
          row.setAttribute('style', 'display:none;');
        }
      }
    }
    
    if (createButton) {
      showButton(columnIndex);
    }
  };
  
  
  //  ==========================
  //  SHOW ALL ROWS
  //  ==========================
  this.showAllRows = function() {
    var rows = this.dom.rows;
    
    rows.forEach( function(row) {
      row.removeAttribute('style');
    });
  };
  
  
  //  ==========================
  //  EDIT A ROW
  //  ==========================
  this.editEntry = function(id) {
    console.log('Editing entry', id);
    console.log(this);
    this.database.editEntry(id);
    return;
  };
  
  //  --- PRIVATE FUNCTIONS ---
  
  //  ==========================
  //  DISPLAY HEADERS
  //  ==========================
  function displayHeaders() {
    if (!((headerRow = this.dom.rows[0]) && headerRow.className === 'headerRow')) {
      headerRow = this.dom.insertRow(0);
    }
    else {
      headerRow.innerHTML = '';
    }
    
    headerRow.setAttribute('class', 'headerRow');
    
    this.headers.forEach( function(columnName) {
      var newHeaderCell = document.createElement('th');
      newHeaderCell.innerHTML = columnName;
      
      headerRow.appendChild(newHeaderCell);
    });
  }
  
  
  //  ==========================
  //  FORMAT TEXT
  //  ==========================
  function formatText(text, columnName) {
    if (text === undefined || typeof columnName !== 'string') {
      throw new Error('Missing parameters!');
    }
    
    if (columnName === 'Amount') {
      return text.toMyCurrencyString();
    }
    else if (columnName === 'Date') {
      if (typeof text !== 'object') {
        throw new Error('Invalid Date!');
      }
      return text.toMyDateString();
    }
    else {
      return text;
    }  
  }
  
  
  //  ==========================
  //  CREATE CELL
  //  ==========================
  function createCell(cellText, columnName) {
    var newCell = document.createElement('td');
    if (columnName === 'Amount') {
      var numberFormat = Number(cellText.replace(/[, ]+/g, ""));
      if (isNaN(numberFormat)) {
        console.log(cellText);
        throw new Error('Invalid number!');
      }
      if (numberFormat >= 0) {
        newCell.setAttribute('class', 'numberFormat positive');
      }
      else {
        newCell.setAttribute('class', 'numberFormat negative');
      }
    }
    newCell.innerHTML = cellText;
    return newCell;
  }
  
  //  ==========================
  //  EDIT BUTTON CLICK
  //  ==========================
  function editButtonClick(event) {
    var id = event.target.parentNode.parentNode.id;
    
    this.editEntry(id);
  }
  
  
  //  ==========================
  //  ADD EVENT LISTENER
  //  ==========================
  function addDataTableEventListeners() {
    var that = this;
    this.dom.addEventListener('click', function dataTableClickEvent(event) {
      var element = event.target;
      if (element.tagName !== 'TD' || element.parentNode.tagName !== 'TR') {
        return false;
      }
      var clickedColumnIndex = element.cellIndex;
      var columnHeaderName = that.dom.rows[0].cells[clickedColumnIndex].innerText;
      var filterText = element.innerText;
      
      if (element.tagName !== 'TH' && element.parentNode.tagName === 'TR' && columnHeaderName !== 'Amount') {
        if (columnHeaderName === 'Date') {
          // TODO: Date click thing
        }
        else if (columnHeaderName === 'Amount') {
          
        }
        else {
          that.filterRows.call(that, filterText, clickedColumnIndex, true);
        }
      }
      event.stopPropagation();
    }, false);
    
    var lastCell = null;
    var lastCellText = '';
    
    this.dom.addEventListener('mouseover', function hoverEdit(event) {
      var cell;
      if (event.target.tagName === 'TD') {
        cell = event.target.parentNode.children[that.headers.indexOf('Amount')];
      }
      else if (event.target.tagName === 'TH') {
        return;
      }
      else if (event.target.tagName === 'TR' && event.target.id !== 'headerRow') {
        cell = event.target.children[that.headers.indexOf('Amount')];
      }
      else {
        return;
      }
      
      if (lastCell !== null) {
        lastCell.innerHTML = lastCellText;
      }
      lastCell = cell;
      lastCellText = cell.innerHTML;
      
      var button = document.createElement('button');
      button.innerHTML = 'Edit';
      button.setAttribute('class', 'edit');
      button.addEventListener('click', editButtonClick.bind(that));
      
      cell.innerHTML = '';
      cell.appendChild(button);
    });
    
    
    this.dom.addEventListener('mouseleave', function tableHoverExit(event) {
      if (lastCell !== null) {
        lastCell.innerHTML = lastCellText;
        lastCell = null;
        lastCellText = '';
      }
    });
  }
  
  
  //  --- ACTUAL EXECUTION ---
  this.dom = dom;
  this.headers = passedHeaders;
  this.database = databaseController;
  displayHeaders.apply(this);
  addDataTableEventListeners.apply(this);
}
// ---------------------------------------------------------------------------------------


//  ==========================
//  TO MY DATE STRING
//  ==========================
Date.prototype.toMyDateString = function() {
  monthName = function(monthNum, option) {
    var monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    if (option === 'long') {
      return monthNames[monthNum];
    }
    else {
      return monthAbbreviations[monthNum];
    }
  };
  return monthName(this.getMonth()) + ' ' + this.getDate() + ', ' + this.getFullYear();
};

