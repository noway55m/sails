var log = require('log4js').getLogger("Register"),
	fs = require('fs'),
	path = require('path'),
    User = require("../../model/user"),
	mailer = require('../../config/nodemailerSetup'),
	mkdirp = require("mkdirp"),
	config = require('../../config/config.js'),
	utilityS = require("../utility.js");

// GET Page of Email notification
exports.email = function(req, res) {
	res.render("admin-view/notification/email.html");
};

// POST Interface for authenticate and register new user
exports.emailSend = function(req, res) {
		
	console.log(req.body.emails);
	console.log(req.body.content);

    if(req.body.emails && req.body.content){
    
        var emails = req.body.emails,
            content = req.body.content,
			mailOptions = {
				from : mailer.defaultOptions.from, // sender address
				subject : "Sails Cloud Announce", // Subject line
				text : "Sails Cloud Announce", // plaintext body
				html : content
			};

        if(emails == "all") {

        	User.count( {}, function(err, count) {

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
		        	for( var k=0; k<totalPage; k++){

		        		(function(page){

						    User.find({})
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