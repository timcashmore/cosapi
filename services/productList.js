
const fs = require('fs');
var productListFile = '../LocalData/ProductList.json';

// Read the local copy of the product List on start-up or when changed
function readProductList() {
    try { 
        var productList = require(productListFile);
        console.log(`ProductList File ${productListFile} successfully Read`);
        return productList;
    } catch (error) {
        console.error(`Error reading file ${productListFile} with ${error}`);
        return null;
    }
}
// Function to update the availability data with additional information
function updateInventoryList(productList, inventoryList) {
    console.log("Updating Description in Inventory List");
    inventoryList.items.forEach( ( inven, i ) => {
            productList.items.some( ( prod ) => {
                if ( inven.productId == prod.productId ) {
                   inven.description = prod.description;
                   inven.catalog = prod.catalog;
                   return true;
                 }
            });
        } );
}
// Function to write JSON data to a local file
function updateLocalFile(file, jsonString) {
    try {
        fs.writeFileSync(file, jsonString);
        console.log(`JSON data is saved in file ${file}`);
    } catch (error) {
            console.error(`Error writing to file ${file} with ${error}`);
    }
} 

module.exports = {readProductList, updateInventoryList, updateLocalFile, productListFile};


