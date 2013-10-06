
/*
 * GET home page.
 */

exports.test1 = function(req, res){
	console.log('test1')
	console.log(req.user);
};

exports.test2 = function(req, res){
	console.log('test2')
};
