var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Coupon model
 */
var couponSchema = new Schema({
	   
    name: String,

    desc: String,

    link: String,

	image: String,

	qeCode: String,

    userId: String,

    createdTime: Date,

    updatedTime: Date    
    
});

var coupon = mongoose.model( 'Coupon', couponSchema );

module.exports = coupon;