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

var months = new Array(12);
months[0] = "January";
months[1] = "February";
months[2] = "March";
months[3] = "April";
months[4] = "May";
months[5] = "June";
months[6] = "July";
months[7] = "August";
months[8] = "September";
months[9] = "October";
months[10] = "November";
months[11] = "December";

internals.GetBlogEntrys = function() {
	var request = this;
	var posts;
	
	connection.query("SELECT * FROM vwAllActivePosts; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
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
	connection.query("SELECT * FROM vwAllActivePosts WHERE BlogID = " + request.params.id + ";SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;SELECT * FROM vwAllActiveComments WHERE BlogID = " + request.params.id + ";", function(err, results) {
		
	var session = request.auth.credentials;
		if (session)
		{post = {entries:results[0],userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],comments:results[3]};}
		else
		{post = {entries:results[0],userstatus:false,archiveresults:results[1],tags:results[2],comments:results[3]};}
		console.log(post);
		request.reply.view('index', post);
	
	});	
}

internals.EntrySearch = function() {
	var request = this;
	var term = request.payload.SearchTerm;
	var searchposts;
	connection.query("SELECT * FROM vwAllActivePosts WHERE BlogContent LIKE " + mysql.escape('%' + term +'%') + "; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
		var session = request.auth.credentials;
		if (session)
		{searchposts = {entries:results[0],userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],search:term};}
		else
		{searchposts = {entries:results[0],userstatus:false,archiveresults:results[1],tags:results[2],search:term};}
		request.reply.view('index', searchposts);	
	});
}

internals.TagSearch = function() {
	var request = this;
	var tagposts;
	var tag = request.params.term;
	connection.query("SELECT * FROM vwAllActivePostsWithTag WHERE TagName LIKE " + mysql.escape('%' + tag +'%') + "; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
		var session = request.auth.credentials;
		if (session)
		{tagposts = {entries:results[0],userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],tagname:tag};}
		else
		{tagposts = {entries:results[0],userstatus:false,archiveresults:results[1],tags:results[2],tagname:tag};}
		request.reply.view('index', tagposts);	
	});
	
}

internals.ArchiveSearch = function() {
	var request = this;
	var archiveposts;
	var year = request.params.year;
	var month = request.params.month;
	connection.query("SELECT BlogID, BlogTitle, BlogContent, DATE_FORMAT(BlogCreateDate,'%W %M %D %Y') as BlogCreateDate FROM blogs WHERE blogdeleted <> 1 AND (DATE_FORMAT(BlogCreateDate,'%m') = " + mysql.escape(month) + " AND DATE_FORMAT(BlogCreateDate,'%Y') = " + mysql.escape(year) +  ")" + " ORDER BY BlogID DESC; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
	
		var session = request.auth.credentials;
		if (session)
		{archiveposts = {entries:results[0],userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],archyear:year,archmth:months[month-1]};}
		else
		{archiveposts = {entries:results[0],userstatus:false,archiveresults:results[1],tags:results[2],archyear:year,archmth:months[month-1]};}
		request.reply.view('index', archiveposts);
	});	
}

exports.GetBlogEntrys = internals.GetBlogEntrys;
exports.GetEntry = internals.GetEntry;
exports.EntrySearch = internals.EntrySearch;
exports.TagSearch = internals.TagSearch;
exports.ArchiveSearch = internals.ArchiveSearch;