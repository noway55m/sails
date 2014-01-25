var log = require('log4js').getLogger("Register"),
	fs = require('fs'),
	path = require('path'),
    User = require("../../model/user"),
	mailer = require('../../config/nodemailerSetup'),
	mkdirp = require("mkdirp"),
	config = require('../../config/config.js'),
	utilityS = require("../utility.js");

var	errorResInfo = utilityS.errorResInfo;

// GET Page of Email notification
exports.email = function(req, res) {
	res.render("admin-view/notification/email.html");
};

// POST Interface for authenticate and register new user
exports.emailSend = function(req, res) {
		
    if(req.body.emails && req.body.content){
    
        var emails = req.body.emails.trim(),
            content = req.body.content,
			mailOptions = {
				from : mailer.defaultOptions.from, // sender address
				subject : "Sails Cloud Announce", // Subject line
				text : "Sails Cloud Announce", // plaintext body
				html : content
			};

        if(emails == "all") {

        	User.count( {

        		username: new RegExp("@", "i")

        	}, function(err, count) {

				if(err) {

					log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});  		

				} else {

					// TODO: extract to mail service
					console.log("total users count: " + count);
					var count = count;
		        	var userLimit = 400;
		        	var totalPage = Math.ceil(count/userLimit);
		        	res.json(errorResInfo.SUCCESS.code, {
		        		total: count		        		
		        	});

		        	for( var k=0; k<totalPage; k++){

		        		(function(page){

						    User.find({ username: new RegExp("@", "i") })
							.limit(userLimit)
							.skip(page * userLimit)
							.exec( function(err, users){

								if(err) {

									log.error("send email get users error");
									log.error(err);
									
								} else {

									// Get user emails list
									var userEmails = "";
									for(var p=0; p<users.length; p++) {
										var theEmail = users[p].username.indexOf("@") == -1 ? "" : users[p].username;
										userEmails += theEmail;
									}
									console.log("userEmails: " + userEmails);

									// Send email
									mailOptions.to = userEmails;
									mailer.sendMail(mailOptions, function(error, response) {
										if (error) {
											log.error(error);
										} else {
											log.error("Message sent: " + response.message);
										}																		
									});

								}

							});

		        		}( k ));

		        	}

				}

        	});	

        } else {

        	if(emails.charAt(emails.length - 1) == ",")
        		emails = emails.slice(0, -1);

        	var total = 1;
        	if( emails.indexOf(",") != -1 )
	        	total = emails.split(",").length;

        	res.json(errorResInfo.SUCCESS.code, {
        		total: total		        		
        	});

        	// Send email
        	mailOptions.to = emails;
			mailer.sendMail(mailOptions, function(error, response) {
				if (error) {
					log.error(error);
				} else {
					log.error("Message sent: " + response.message);
				}																		
			});

        }

    }

};