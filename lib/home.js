var internals = {};
var mysql = require('mysql');
var db = require('./db').config;
var connection = mysql.createConnection({
  multipleStatements: true,
  host     : db.hostname,
  user     : db.user,
  password : db.password,
  database : db.db,
});

internals.GetBlogEntrys = function() {
	var request = this;
	var posts;
	
	connection.query("SELECT BlogID, BlogTitle, BlogContent, DATE_FORMAT(BlogCreateDate,'%W %M %D %Y') as BlogCreateDate FROM blogs WHERE blogdeleted <> 1 ORDER BY BlogID DESC LIMIT 5; SELECT * FROM BlogArchive; SELECT * FROM vwactivetags;", function(err, results) {
	var session = request.auth.credentials;
		if (session)
		{posts = {entries:results[0],userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2]};}
		else
		{posts = {entries:results[0],userstatus:false,archiveresults:results[1],tags:results[2]};}
		request.reply.view('index', posts);
	});	
}

internals.GetEntry = function() {
	var request = this;
	var post;
	connection.query("SELECT BlogID, BlogTitle, BlogContent, DATE_FORMAT(BlogCreateDate,'%W %M %D %Y') as BlogCreateDate FROM blogs WHERE blogdeleted <> 1 and BlogID = " + request.params.id + " ORDER BY BlogID DESC; SELECT * FROM BlogArchive; SELECT * FROM vwactivetags;", function(err, results) {
		
	var session = request.auth.credentials;
		if (session)
		{post = {entries:results[0],userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2]};}
		else
		{post = {entries:results[0],userstatus:false,archiveresults:results[1],tags:results[2]};}
		request.reply.view('index', post);
	
	});	
}

internals.EntrySearch = function() {
	var request = this;
	request.reply('Text Search');
}

internals.TagSearch = function() {
	var request = this;
	request.reply('Tag Search');
}

internals.ArchiveSearch = function() {
	var request = this;
	request.reply('Archive Search');
}

exports.GetBlogEntrys = internals.GetBlogEntrys;
exports.GetEntry = internals.GetEntry;
exports.EntrySearch = internals.EntrySearch;
exports.TagSearch = internals.TagSearch;
exports.ArchiveSearch = internals.ArchiveSearch;