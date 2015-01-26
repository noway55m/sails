
/*
 * GET home page.
 */

exports.index = function(req, res){
	// console.log(req.params)
	// console.log(req.query)
	// console.log(req.query.data)
  res.render('index.html', { 
	  url: req.url.toString(), // use in layout for identify display info
	  activate : req.flash('activate') || "",
  });
};