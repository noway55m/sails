var log = require('log4js').getLogger(),
    fs = require('fs'), 
	path = require('path'),    
	config = require('../config/config');
// Page for show the store in the floor of specific building
exports.download = function(req, res) {	
	res.render("others/download.html");
};

// Interface for download ios or android sdk
exports.downloadSdk = function(req, res){

    var fileName = req.params.platform,
        filePath = path.dirname() + "/" + config.sdkPath + '/' + fileName + '.jar',
        stat = fs.statSync(filePath);
    res.writeHead(200, {
        "Content-type": "application/octet-stream",
        "Content-disposition": "attachment; filename=" + fileName + ".jar",
        "Content-Length": stat.size
    });

    var readStream = fs.createReadStream(filePath);

    // We replaced all the event handlers with a simple call to util.pump()
    readStream.pipe(res);

}