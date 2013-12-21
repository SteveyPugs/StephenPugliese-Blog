var internals = {}
var dbconfig = require('../config/database').config
var dbname = dbconfig.db
var dbhostname = dbconfig.hostname
var dbport = dbconfig.port
var dbuser = dbconfig.user
var dbpassword = dbconfig.password

var Sequelize = require("sequelize");

var sequelize = new Sequelize(dbname, dbuser, dbpassword, {
    host: dbhostname,
    port: dbport
});

var models = require('./models');

internals.PostNew = function() {
	var request = this;
	var session = request.auth.credentials;
	request.reply.view('posts/index', {userid:session.adminid,userstatus:true});
}

internals.PostEdit = function() {
	var request = this;
	models.BlogEntries.findAll({ where: { BlogID: request.params.id, BlogDeleted:false }, order: 'BlogID'}).success(function(postResults) {
		var output = []
		for (x = 0; x < postResults.length; x++){
			var output_single = {};
            output_single.BlogID = postResults[x].BlogID;
            output_single.BlogTitle = postResults[x].BlogTitle;
            output_single.BlogContent = postResults[x].BlogContent
            output_single.BlogCreateDate = postResults[x].BlogCreateDate;
            output_single.Draft = postResults[x].Draft;
            output.push(output_single);
		}
		entries = {entries:output, userstatus:true};
		request.reply.view('posts/index', entries);
	})
}

internals.PostSave = function() {
	var request = this;	
	var session = request.auth.credentials;
	switch(request.payload.Type)
	{
	case "N":
		models.BlogEntries.create({BlogTitle: request.payload.Title, BlogContent: request.payload.Content, BlogCreateDate: new Date(), BlogDeleted:0, AdminID: session.adminid, Draft: request.payload.Draft}).success(function(userCreated) {
			request.reply.redirect('/');
		})
		break;
	case "E":
		models.BlogEntries.update({BlogTitle: request.payload.Title, BlogContent: request.payload.Content, Draft: request.payload.Draft},{BlogID: request.payload.BlogID}).success(function() {
    		request.reply.redirect('/post/' + request.payload.BlogID);
		})
		break;
	}
}

internals.CommentSave = function() {
	var request = this;
	var session = request.auth.credentials;
	var adminid = 0;
	if (session != undefined){
		adminid = session.adminid
	}
	models.Comments.create({ BlogID: request.payload.BlogID, CommentName: request.payload.Name, CommentContent: request.payload.Comment, AdminID: adminid, CommentCreatedDate: new Date(), CommentDeleted:0}).success(function(userCreated) {
		request.reply.redirect('/post/' + request.payload.BlogID);
	})	
}

exports.PostNew = internals.PostNew;
exports.PostEdit = internals.PostEdit;
exports.PostSave = internals.PostSave;
exports.CommentSave = internals.CommentSave;