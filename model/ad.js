var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Ad model
 */
var adSchema = new Schema({
	
    name: String, 
    
    image: String, 
    
    price: Number,
    
    startTime: Date,

    endTime: Date,    
    
    desc: String,
        
    storeId: String
    
});

var ad = mongoose.model( 'Ad', adSchema );

module.exports = ad;