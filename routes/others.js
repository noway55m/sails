var log = require('log4js').getLogger(),
    fs = require('fs'),
    utilityS = require("./utility.js"),     
	path = require('path'), 
    Sdk = require("../model/sdk"),
    SdkDownloadLog = require("../model/admin/sdkDownloadLog"),           
	config = require('../config/config'),
    ga = require('./googleAnalytics'),
    i18n = require("i18n");


// Static variable
var errorResInfo = utilityS.errorResInfo,
    mapinfo_path = "/" + config.mapInfoPath,
    image_path = config.imagePath;

// Page for terms	
exports.terms = function(req, res) {	
	res.render("others/terms.html",{
		user: null,
		imagePath: image_path
	});
}	

// Page for show downalod links, like: sdk, sample code an doc of android and ios
exports.download = function(req, res) {	
	
    Sdk.find({

        isCurrentVersion: true

    }, function( err, sdks ){

        if( err ) {

            log.error(err);
            res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
                msg: i18n.__('error.500Error')
            });         

        } else {

            var android, ios;
            for( var i=0; i<sdks.length; i++ ){

                if( sdks[i].osType == Sdk.OS_TYPE.ANDROID ) {

                    android = sdks[i];

                } else {

                    ios = sdks[i];

                }

            }

            res.render("others/download.html", {

                android: android,
                ios: ios

            });

        }

    });

};

// Interface for download ios or android sdk
exports.downloadSdk = function(req, res){

    var platform = req.params.platform,
        fileName = req.params.fileName,
        filePath = path.dirname() + "/" + config.sailsResPath + "/" + platform + "/" + fileName,
        stat = fs.statSync(filePath);

    res.writeHead(200, {
        "Content-type": "application/octet-stream",
        "Content-disposition": "attachment; filename=" + fileName,
        "Content-Length": stat.size
    });

    var readStream = fs.createReadStream(filePath);

    // We replaced all the event handlers with a simple call to util.pump()
    readStream.pipe(res);


    // Use ga to collect all user download times
    var title = platform + " sdk download";
    ga.measurementTool.pageTracking(req, title);


    // Record the download log
    //recordSdkDownloadLog(platform, req.user._id);

}

// Interface for download ios or android sdk
exports.downloadSampleCode = function(req, res){

    var platform = req.params.platform,
        fileName = req.params.fileName,
        filePath = path.dirname() + "/" + config.sailsResPath + "/" + platform + "/" + fileName,
        stat = fs.statSync(filePath);

    res.writeHead(200, {
        "Content-type": "application/octet-stream",
        "Content-disposition": "attachment; filename=" + fileName,
        "Content-Length": stat.size
    });

    var readStream = fs.createReadStream(filePath);

    // We replaced all the event handlers with a simple call to util.pump()
    readStream.pipe(res);

}

// Function for record sdk download log
function recordSdkDownloadLog(platform, userId) {

    var platformCode = 0;
    if(platform == "android")
        platformCode = Sdk.OS_TYPE.ANDROID;
    else
        platformCode = Sdk.OS_TYPE.IOS;


    Sdk.findOne({

        isCurrentVersion: true,
        osType: platformCode

    }, function(err, sdk) {

        if(err) {

            log.error(err);

        } else {

            new SdkDownloadLog({

                osType: platformCode,
                sdkId: sdk._id,
                userId: userId,
                createdTime: new Date()        

            }).save(function(err, sdkDownloadLog){

                if(err)
                    log.error(err);

            });

        }

    });

}