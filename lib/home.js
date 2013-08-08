var internals = {};
var mysql = require('mysql');
var andlebars = require('handlebars');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'whateveruser',
  password : 'whateverpassword',
  database : 'whateverDB',
});

internals.GetBlogEntrys = function() {
	var request = this;
	var blogEntrys;
	connection.query("SELECT BlogID, BlogTitle, BlogContent, BlogCreateDate FROM blogs WHERE blogdeleted <> 1 ORDER BY BlogID DESC;", function(err, results) {
	blogEntrys = {entries:results};
	request.reply.view('index', blogEntrys);
	});	
}
exports.GetBlogEntrys = internals.GetBlogEntrys;