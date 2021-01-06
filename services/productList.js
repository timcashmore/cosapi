
const fs = require('fs');
//var productListFile = '../LocalData/ProductList.json';

var csvtojson = require('csvtojson');

// Read the local copy of the product List on start-up or when changed

var prodList = [];

function readCSVProdList() {
        // Read CSV file as a JSON object array
        csvtojson().fromFile('./LocalData/prodFile.csv')
        .then( list => {
            prodList = list.slice();
            prodList.forEach( item => {console.log(item.productId)});
            console.log(`prodList Length = ${prodList.length}`);
        }).catch(error => {
            console.error(`Error reading file with ${error}`);
        });  
}

/*function readProductList() {
    prodList.forEach(prod => console.log(prod.productId));
    try { 
        // Read JSON File of Product Description and Catalog
        var productList = require(productListFile);
        console.log(`ProductList File ${productListFile} successfully Read`);
        return productList;
    } catch (error) {
        console.error(`Error reading file ${productListFile} with ${error}`);
        return null;
    }
}*/

// Function to update the availability data with additional information
function updateInventoryList(inventoryList) {
    console.log("Updating Description in Inventory List " + prodList.length);
//    prodList.forEach(item =>{console.log(item.productId)});
    if(prodList.length > 0 ) {
        inventoryList.items.forEach( ( inven, i ) => {
//            productList.items.some( ( prod ) => {
              prodList.some( prod => {
                if ( inven.productId == prod.productId ) {
                   inven.description = prod.description;
                   inven.catalog = prod.catalog;
                   return true;
                 }
            });
        } );
    }
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

module.exports = {updateInventoryList, updateLocalFile, readCSVProdList};


