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
            output_single.BlogID = postResults[x].dataValues.BlogID;
            output_single.BlogTitle = postResults[x].dataValues.BlogTitle;
            output_single.BlogContent = postResults[x].dataValues.BlogContent
            output_single.BlogCreateDate = postResults[x].dataValues.BlogCreateDate;
            output.push(output_single);
		}
		entries = {entries:output, userstatus:true};
		request.reply.view('posts/index', entries);
	})
}

internals.PostSave = function() {
	var request = this;	
	var session = request.auth.credentials;
	console.log(session.rows[0])
	switch(request.payload.Type)
	{
	case "N":
		models.BlogEntries.create({BlogTitle: request.payload.Title, BlogContent: request.payload.Content, BlogCreateDate: new Date(), BlogDeleted:0, AdminID: session.rows[0].adminid}).success(function(userCreated) {
			request.reply.redirect('/');
		})
		break;
	case "E":
		models.BlogEntries.update({BlogTitle: request.payload.Title, BlogContent: request.payload.Content},{BlogID: request.payload.BlogID}).success(function() {
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
		adminid = session.rows[0].adminid
	}
	models.Comments.create({ BlogID: request.payload.BlogID, CommentName: request.payload.Name, CommentContent: request.payload.Comment, AdminID: adminid, CommentCreatedDate: new Date(), CommentDeleted:0}).success(function(userCreated) {
		request.reply.redirect('/post/' + request.payload.BlogID);
	})	
}

exports.PostNew = internals.PostNew;
exports.PostEdit = internals.PostEdit;
exports.PostSave = internals.PostSave;
exports.CommentSave = internals.CommentSave;