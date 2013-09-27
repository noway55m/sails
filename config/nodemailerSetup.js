var nodemailer  = require('nodemailer');

var mailer = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "iasolutionid1@gmail.com",
        pass: "AplixAplix"
    }
});

mailer.defaultOptions = {
    from : "iasolutionid1@gmail.com"
};

module.exports = mailer;