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

internals.PostNew = function() {
	var request = this;
	var activeTags; 
	connection.query("SELECT * FROM vwAllActiveTags;", function(err, results) {
		var session = request.auth.credentials;
		activeTags = {tags:results,userid:session.adminid,userstatus:true};
		request.reply.view('posts/index', activeTags);
	});	
}

internals.PostEdit = function() {
	var request = this;
	var PostToEdit;
	connection.query("SELECT * FROM vwAllActiveTags;SELECT * FROM vwallactiveposts WHERE BlogID = " + mysql.escape(request.params.id) + ";", function(err, results) {
		var session = request.auth.credentials;
		PostToEdit = {tags:results[0],userid:session.adminid,userstatus:true,post:results[1]};
		request.reply.view('posts/index', PostToEdit);
	});
}

internals.PostSave = function() {
	var request = this;
	var session = request.auth.credentials;
	var adminid = session.adminid;
	var title = request.payload.Title;
	var content = request.payload.Content;
	var type = request.payload.Type;
	var id = request.payload.BlogID;
	var tagid = request.payload.TagID;
	
	switch(type)
	{
	case "N":
		connection.query("INSERT INTO Blogs (BlogTitle, BlogContent, AdminID, TagID) VALUES (" + mysql.escape(title) + "," + mysql.escape(content) + "," + mysql.escape(adminid) + "," + mysql.escape(tagid) + ")", function(err, results) {
		request.reply.redirect('/');
		});
		break;
	case "E":
		connection.query("UPDATE Blogs SET BlogTitle = " + mysql.escape(title) + ", BlogContent = " + mysql.escape(content) + ", TagID = " + mysql.escape(tagid) + " WHERE BlogID = " + mysql.escape(id), function(err, results) {
		request.reply.redirect('/post/' + id);
		});
		break;
	}
}



internals.TagsEdit = function() {
	var request = this;
	request.reply("tags admin page");
}

exports.PostNew = internals.PostNew;
exports.PostEdit = internals.PostEdit;
exports.PostSave = internals.PostSave;
exports.TagsEdit = internals.TagsEdit;
