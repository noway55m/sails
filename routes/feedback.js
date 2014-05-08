var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("./utility.js"),
    mkdirp = require("mkdirp"),
	Feedback = require("../model/feedback"),
    crypto = require('crypto'),
    fs = require('fs'),
	path = require('path'),
	util = require('util'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// GET Page for user feedback
exports.index = function(req, res) {
    res.render("feedback/index.html", {
        url : req.url.toString(), // use in layout for identify display info
        errorMsg : req.flash('msg') || "",
        user: null,
        imagePath: image_path,
        domainUrl: config.domainUrl
    });
}

// POST Interface for create feeedback
exports.create = function(req, res) {

    if( req.body.name && req.body.comment ) {

        new Feedback({

            name: req.body.name,
            email: req.body.email,
            comment: req.body.comment,
            createdTime: new Date()

        }).save(function( err, feedback ){

            if(err) {

                log.error(err);
                res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
                    msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
                });     

            } else {

                res.json( errorResInfo.SUCCESS.code, feedback );

            }

        });

    } else {
      
        res.json( errorResInfo.INCORRECT_PARAMS.code , { 
            msg: errorResInfo.INCORRECT_PARAMS.msg
        });        

    }

};