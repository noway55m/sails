var nodemailer  = require('nodemailer');

var mailer = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "admin@sailstech.com",
        pass: "felix123"
    }
});

mailer.defaultOptions = {
    from : "admin@sailstech.com"
};

module.exports = mailer;