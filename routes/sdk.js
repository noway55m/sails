var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("./utility.js"),
    SdkGlobalVersion = require("../model/sdkGlobalVersion"),    
    crypto = require('crypto'),
    config = require('../config/config'),
    fs = require('fs'),
	path = require('path'),
	util = require('util'),
    i18n = require("i18n");

// Static variable
var errorResInfo = utilityS.errorResInfo,
    mapinfo_path = "/" + config.mapInfoPath,
    image_path = config.imagePath;

// GET Interface for get building info
exports.getGlobalVersion = function(req, res){

    SdkGlobalVersion.findOne({}, function(err, sdkGlobalVersion){

        if(err) {

            log.error(err);
            res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
                msg: i18n.__('error.500Error')
            });  

        } else {

            if(sdkGlobalVersion) {

                res.json(errorResInfo.SUCCESS.code, sdkGlobalVersion);

            } else {

                res.json(errorResInfo.SUCCESS.code, {

                    msg: "SDK global version is not set yet!"

                });

            }

        }

    });

};