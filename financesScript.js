/*
financesScript.js
Financial Vir
Summer 2015 (first created)
*/

function newUserPrompt(overlayController, newEntryController) {
  console.log('Empty database!');
  document.getElementById('overlayNewUser').removeAttribute('style');
  document.getElementById('newUserNewButton').addEventListener('click', function() {
    
    document.getElementById('overlayNewUser').setAttribute('style', 'display:none;');
    overlayController.hide();
    newEntryController.display();
  });
  overlayController.display(false);
}

function prepareMonthCalculations(calc) {
  // TODO: code this
  console.log('month calculations');
  return {};
}

function prepareCategoryCalculations(calc) {
  
  var obj = {};
  
  obj.primaryData = calc.categoryData;
  obj.secondaryData = calc.subCategoryData;
  
  return obj;
}

function init(controllers, calculations) {
  
  /**
   * loads all the controllers
   * @param {object} controllers  the container of all controllers
   * @param {object} calc  the container of calculations
   * 
   * The order that these are loaded in is important because some of of them are dependent on the others.
   */
  function loadOtherControllers(controllers, calc) {    
    
    // Data Table
    controllers.dataTable = new DataTableController(document.getElementById('dataTable'), controllers.database.organization.Columns);
    
    controllers.dataTable.addAllRows(controllers.database.entries);
    
    // New Entry
    controllers.newEntry = new DataEntryController(document.getElementById('overlayNewEntry'), controllers.database.organization, controllers.overlay);
    
    // Main Menu
    controllers.mainMenu = new MenuController(document.getElementById('mainMenu'), controllers.database.organization, controllers.dataTable, controllers.newEntry);
    
    // Category Details Table
    controllers.categoryData = new DetailsTableController('Categories', document.getElementById('categoryDataWrapper'), prepareCategoryCalculations(calc));
    
    // Month Details Table
    // TODO: create setup functions so this controller can be used
    // controllers.monthData = new DetailsTableController(document.getElementById('monthDataWrapper'), prepareMonthCalculations(calc));
  }
  
  /**
   * loads the controllers needed for the loading screen
   * @param {object} controllers  the object to append the controllers to
   * 
   * The order that these are loaded in is important because some of of them are dependent on the others.
   */
  function loadLoadingControllers(controllers) {
    // Overlay
    controllers.overlay = new OverlayController(document.getElementById('overlay'));
    
    // Loading Screen
    controllers.loading = new LoadingController(document.getElementById('overlayLoading'), controllers.overlay);
  }
  
  
  loadLoadingControllers(controllers);
  controllers.loading.display();
  controllers.database = new DatabaseController();
  
  controllers.database.initializeDatabase(function(numEntries) {
    calculations = calculateCategoryData(controllers.database);
    loadOtherControllers(controllers, calculations);
    controllers.loading.hide();
    if (numEntries === 0) {
      newUserPrompt(controllers.overlay, controllers.newEntry);
    }
  });
  
}





