var internals = {};
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'xxxxxxxxx',
  password : 'xxxxxxxxx',
  database : 'xxxxxxxxx',
});

internals.GetBlogEntrys = function() {
	var request = this;
	var entries;
	connection.query("SELECT BlogID, BlogTitle, BlogContent, DATE_FORMAT(BlogCreateDate,'%W %M %D %Y') as BlogCreateDate FROM blogs WHERE blogdeleted <> 1 ORDER BY BlogID DESC LIMIT 5;", function(err, results) {
	
	var session = request.auth.credentials;
	
	if (session)
	{entries = {entries:results,userid:session.adminid,userstatus:true};}
	else
	{entries = {entries:results,userstatus:false};}
	request.reply.view('index', entries);
	});	
}

internals.GetEntry = function() {
	var request = this;
	var post;
	connection.query("SELECT BlogID, BlogTitle, BlogContent, DATE_FORMAT(BlogCreateDate,'%W %M %D %Y') as BlogCreateDate FROM blogs WHERE blogdeleted <> 1 and BlogID = " + request.params.id + " ORDER BY BlogID DESC;", function(err, results) {
	post = {entries:results};
	request.reply.view('index', post);
	});	
}


exports.GetBlogEntrys = internals.GetBlogEntrys;
exports.GetEntry = internals.GetEntry;