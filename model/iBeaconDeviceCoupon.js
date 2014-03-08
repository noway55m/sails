var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * iBeaconDeviceCoupon model
 */
var iBeaconDeviceCouponSchema = new Schema({
	   
    iBeaconDeviceId: String,

    couponId: String
    
});

var iBeaconDeviceCoupon = mongoose.model( 'iBeaconDeviceCoupon', iBeaconDeviceCouponSchema );

module.exports = iBeaconDeviceCoupon;