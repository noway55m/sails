var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Floor model
 */
var addSchema = new Schema({
	
    name: String, // *require and unique
    
    image: String, 
    
    price: Number,
    
    startTime: Date,

    endTime: Date,    
    
    desc: String,
        
    storeId: String
    
});

var add = mongoose.model( 'Add', addSchema );

module.exports = add;