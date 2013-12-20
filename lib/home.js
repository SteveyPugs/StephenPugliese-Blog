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


internals.HTMLParse = function(Content) {
	Content = JSON.stringify(Content);
	Content = Content.replace(/\[B\]/g, "<B>").replace(/\[\/B\]/g, "</B>");
	Content = Content.replace(/\[I\]/g, "<I>").replace(/\[\/I\]/g, "</I>");
	Content = Content.replace(/\[U\]/g, "<U>").replace(/\[\/U\]/g, "</U>");
	Content = Content.replace(/\[BR\]/g, "<BR />");
	Content = Content.replace(/\[QUOTE\]/g, "&quot;").replace(/\[\/QUOTE\]/g, "&quot;");
	Content = Content.replace(/\[BLOCKQUOTE\]/g, "<BLOCKQUOTE>").replace(/\[\/BLOCKQUOTE\]/g, "</BLOCKQUOTE>");
	Content = Content.replace(/\[A HREF=/g,"<A HREF=").replace(/\[\/A\]/g, "</A>");
	Content = Content.replace(/\[YOUTUBE HREF=/g,"<IFRAME WIDTH=100% HEIGHT=360 FRAMEBORDER=0 ALLOWFULLSCREEN SRC=").replace(/\[\/YOUTUBE\]/g, "</IFRAME>");
	Content = Content.replace(/\[IMG SRC=/g,"<IMG SRC=")
	Content = Content.replace(/'\]/g,"'>");
	Content = JSON.parse(Content);
	return Content;
}


internals.GetBlogEntrys = function() {
	var request = this;
	var session = request.auth.credentials;
	var query
	if (request.params.id != undefined){
		query = { where: { BlogID: request.params.id, BlogDeleted:false }};
	}
	else{
		query = { where: { BlogDeleted:false }, order: 'BlogID DESC'};
	}

	models.BlogEntries.findAll(query).success(function(postResults) {
		var output = []
		for (x = 0; x < postResults.length; x++){
			var output_single = {};
            output_single.BlogID = postResults[x].dataValues.BlogID;
            output_single.BlogTitle = postResults[x].dataValues.BlogTitle;
            output_single.BlogContent = internals.HTMLParse(postResults[x].dataValues.BlogContent)
            output_single.BlogCreateDate = postResults[x].dataValues.BlogCreateDate;
            output.push(output_single);
		}
		if (session){ 
			entries = {entries:output,userstatus:true,userid:session.adminid};
		}
		else{
			entries = {entries:output,userstatus:false};	
		}
		request.reply.view('index', entries);
	})
}

internals.GetComments = function() {
	var request = this;
	var session = request.auth.credentials;

	models.Comments.findAll({ where: { BlogID: request.params.id, CommentDeleted:false }, order: 'CommentID'}).success(function(comments) {
		var output = []
		for (x = 0; x < comments.length; x++){
			var output_single = {};
			output_single.CommentID = comments[x].dataValues.CommentID;
            output_single.BlogID = comments[x].dataValues.BlogID;
            output_single.CommentName = comments[x].dataValues.CommentName;
            output_single.CommentContent = comments[x].dataValues.CommentContent
            output.push(output_single);
		}

		if (session){ 
			comments = {comments:output,userstatus:true,blogid:request.params.id,userid:session.adminid};
		}
		else{
			comments = {comments:output,userstatus:false,blogid:request.params.id};	
		}
		request.reply.view('comments/index', comments);
	})
}


exports.GetBlogEntrys = internals.GetBlogEntrys;
exports.GetComments = internals.GetComments;