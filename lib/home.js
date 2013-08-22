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

internals.HTMLParse = function(Content) {
	Content = JSON.stringify(Content);
	Content = Content.replace(/\[B\]/g, "<B>");
	Content = Content.replace(/\[\/B\]/g, "</B>");
	Content = Content.replace(/\[I\]/g, "<I>");
	Content = Content.replace(/\[\/I\]/g, "</I>");
	Content = Content.replace(/\[U\]/g, "<U>");
	Content = Content.replace(/\[\/U\]/g, "</U>");
	Content = Content.replace(/\[BR\]/g, "<BR />");
	Content = Content.replace(/\[QUOTE\]/g, "&quot;");
	Content = Content.replace(/\[\/QUOTE\]/g, "&quot;");
	Content = Content.replace(/\[BLOCKQUOTE\]/g, "<BLOCKQUOTE>");
	Content = Content.replace(/\[\/BLOCKQUOTE\]/g, "</BLOCKQUOTE>");
	Content = Content.replace(/\[A HREF=/g,"<A HREF=");
	Content = Content.replace(/\[\/A\]/g, "</A>");
	Content = Content.replace(/\[YOUTUBE HREF=/g,"<IFRAME WIDTH=100% HEIGHT=360 FRAMEBORDER=0 ALLOWFULLSCREEN SRC=");
	Content = Content.replace(/\[\/YOUTUBE\]/g, "</IFRAME>");
	Content = Content.replace(/\[IMG SRC=/g,"<IMG SRC=")
	Content = Content.replace(/'\]/g,"'>");
	Content = JSON.parse(Content);
	return Content;
}

internals.GetBlogEntrys = function() {
	var request = this;
	var posts;
	
	connection.query("SELECT * FROM vwAllActivePosts; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
	var session = request.auth.credentials;
	posts = internals.HTMLParse(results[0]);
		//posts = JSON.parse(posts);
		if (session)
		{posts = {entries:posts,userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2]};}
		else
		{posts = {entries:posts,userstatus:false,archiveresults:results[1],tags:results[2]};}	
		request.reply.view('index', posts);
	});	
}

internals.GetEntry = function() {
	var request = this;
	var post;
	connection.query("SELECT * FROM vwAllActivePosts WHERE BlogID = " + mysql.escape(request.params.id) + ";SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;SELECT * FROM vwAllActiveComments WHERE BlogID = " + mysql.escape(request.params.id) + ";", function(err, results) {
		
	var session = request.auth.credentials;
	posts = internals.HTMLParse(results[0]);
		//if (results[0].length > 0)
		//{
			if (session)
			{post = {entries:posts,userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],comments:results[3],newcomment:true};}
			else
			{post = {entries:posts,userstatus:false,archiveresults:results[1],tags:results[2],comments:results[3],newcomment:true};}
			request.reply.view('index', post);
		//}
	});	
}

internals.EntrySearch = function() {
	var request = this;
	var term = request.payload.SearchTerm;
	var searchposts;
	connection.query("SELECT * FROM vwAllActivePosts WHERE BlogContent LIKE " + mysql.escape('%' + term +'%') + "; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
		posts = internals.HTMLParse(results[0]);
		var session = request.auth.credentials;
		if (session)
		{searchposts = {entries:posts,userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],search:term};}
		else
		{searchposts = {entries:posts,userstatus:false,archiveresults:results[1],tags:results[2],search:term};}
		request.reply.view('index', searchposts);	
	});
}

internals.TagSearch = function() {
	var request = this;
	var tagposts;
	var tag = request.params.term;
	connection.query("SELECT * FROM vwAllActivePostsWithTag WHERE TagName LIKE " + mysql.escape('%' + tag +'%') + "; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
		var session = request.auth.credentials;
		posts = internals.HTMLParse(results[0]);
		if (session)
		{tagposts = {entries:posts,userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],tagname:tag};}
		else
		{tagposts = {entries:posts,userstatus:false,archiveresults:results[1],tags:results[2],tagname:tag};}
		request.reply.view('index', tagposts);	
	});
	
}

internals.ArchiveSearch = function() {
	var request = this;
	var archiveposts;
	var year = request.params.year;
	var month = request.params.month;
	connection.query("SELECT blogs.BlogID, BlogTitle, BlogContent, DATE_FORMAT(BlogCreateDate,'%W %M %D %Y') as BlogCreateDate, count(comments.CommentID) AS CommentAmount, tags.TagID, TagName FROM blogs LEFT JOIN comments ON comments.BlogID = blogs.BlogID AND comments.CommentDeleted <> 1 LEFT JOIN tags ON blogs.TagID = tags.TagID WHERE blogdeleted <> 1 AND (DATE_FORMAT(BlogCreateDate,'%m') = " + mysql.escape(month) + " AND DATE_FORMAT(BlogCreateDate,'%Y') = " + mysql.escape(year) +  ")" + " GROUP BY BlogID, BlogTitle, BlogContent, BlogCreateDate ORDER BY BlogID DESC; SELECT * FROM vwArchiveList; SELECT * FROM vwAllActiveTags;", function(err, results) {
		
	
		var session = request.auth.credentials;
		posts = internals.HTMLParse(results[0]);
		if (session)
		{archiveposts = {entries:posts,userid:session.adminid,userstatus:true,archiveresults:results[1],tags:results[2],archyear:year,archmth:months[month-1]};}
		else
		{archiveposts = {entries:posts,userstatus:false,archiveresults:results[1],tags:results[2],archyear:year,archmth:months[month-1]};}
		request.reply.view('index', archiveposts);
	});	
}

exports.GetBlogEntrys = internals.GetBlogEntrys;
exports.GetEntry = internals.GetEntry;
exports.EntrySearch = internals.EntrySearch;
exports.TagSearch = internals.TagSearch;
exports.ArchiveSearch = internals.ArchiveSearch;
