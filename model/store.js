var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Floor model
 */
var storeSchema = new Schema({
	
    name: String, // *require and unique
    
    icon: String, 
    
    link: String,
    
    phone: String,
    
    memo: String,

    floorId: String
    
});

var store = mongoose.model( 'Store', storeSchema );

module.exports = store;