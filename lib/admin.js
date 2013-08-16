var internals = {};
var mysql = require('mysql');
var db = require('./db').config;
var connection = mysql.createConnection({
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
		if (session)
		{activeTags = {tags:results[0],userid:session.adminid,userstatus:true};}
		else
		{activeTags = {tags:results[0],userid:session.adminid,userstatus:false};}
		console.log(activeTags);
		request.reply.view('posts/index', activeTags);
	});	
}

internals.PostEdit = function() {
	var request = this;
	request.reply("edit posts page");
}

internals.TagsEdit = function() {
	var request = this;
	request.reply("tags admin page");
}

exports.PostNew = internals.PostNew;
exports.PostEdit = internals.PostEdit;
exports.TagsEdit = internals.TagsEdit;
