const prodL = require('./services/productList.js');



var productList = prodL.readProductList();

// For local testing = read a local file
var inventoryList = require('./LocalData/inventoryList.json');
//Only update if valid file read for local testing
if (productList != null) {prodL.updateInventoryList(productList, inventoryList) };

prodL.updateLocalFile("./LocalData/updatedInventoryList.json", JSON.stringify(inventoryList));
