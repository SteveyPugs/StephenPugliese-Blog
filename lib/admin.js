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
	request.reply("new posts page");
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
