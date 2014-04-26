var mongoose = require("./../dataSource.js"),
	Schema = mongoose.Schema;


/**
 * SdkDownloadLog model
 */
var sdkDownloadLogSchema = new Schema({
	
    osType: Number, // follow SDK.OS_TYPE

    sdkId: String,

    userId: String,

    createdTime: Date

});

var sdkDownloadLog = mongoose.model( 'SdkDownloadLog', sdkDownloadLogSchema );

module.exports = sdkDownloadLog;