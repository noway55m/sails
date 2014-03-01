var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * GeofenceCoupon model
 */
var geofenceCouponSchema = new Schema({
	   
    geofenceId: String

    couponId: String
    
});

var geofenceCoupon = mongoose.model( 'GeofenceCouponSchema', geofenceCouponSchema );

module.exports = geofenceCoupon;