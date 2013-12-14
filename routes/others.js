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

    var platform = req.params.platform,
        filePath,
        fileName,
        stat;

    if(platform == 'android'){

        filePath = path.dirname() + "/" + config.androidSdkPath;
        
    } else {

        filePath = path.dirname() + "/" + config.iosSdkPath;
        
    }
    fileName = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length);
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

// Interface for download ios or android sdk
exports.downloadSampleCode = function(req, res){

    var platform = req.params.platform,
        filePath,
        stat;
    if(platform == 'android'){

        filePath = path.dirname() + "/" + config.androidSampleCodePath;
        
    } else {

        filePath = path.dirname() + "/" + config.iosSampleCodePath;
        
    }    
    stat = fs.statSync(filePath);
    res.writeHead(200, {
        "Content-type": "application/octet-stream",
        "Content-disposition": "attachment; filename=SampleCode.rar",
        "Content-Length": stat.size
    });

    var readStream = fs.createReadStream(filePath);

    // We replaced all the event handlers with a simple call to util.pump()
    readStream.pipe(res);

}