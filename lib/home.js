var internals = {}
var dbconfig = require('../config/database').config
var dbname = dbconfig.db
var dbhostname = dbconfig.hostname
var dbport = dbconfig.port
var dbuser = dbconfig.user
var dbpassword = dbconfig.password

var Sequelize = require("sequelize");
var moment = require('moment');
var Feed = require('feed');

var sequelize = new Sequelize(dbname, dbuser, dbpassword, {
    host: dbhostname,
    port: dbport,
    logging:false
});

//http://howtonode.org/content-syndication-with-node
var feed = new Feed({
    title:          'End Of Line',
    description:    'End of Line Blog',
    link:           'http://www.endoflne.com/',
    copyright:      'Copyright © 2014 Stephen Pugliese. All rights reserved',
    author: {
        name:       'Stephen Pugliese',
        email:      'stephen.pugliese@outlook.com',
        link:       'https://www.stephenpugliese.com/'
    }
});

var models = require('./models');


internals.HTMLParse = function(Content) {
	Content = JSON.stringify(Content);
	Content = Content.replace(/\[B\]/g, "<B>").replace(/\[\/B\]/g, "</B>");
	Content = Content.replace(/\[I\]/g, "<I>").replace(/\[\/I\]/g, "</I>");
	Content = Content.replace(/\[U\]/g, "<U>").replace(/\[\/U\]/g, "</U>");
	Content = Content.replace(/\[BR\]/g, "<BR />");
	Content = Content.replace(/\[QUOTE\]/g, "&quot;").replace(/\[\/QUOTE\]/g, "&quot;");
	Content = Content.replace(/\[BLOCKQUOTE\]/g, "<CITE><b>").replace(/\[\/BLOCKQUOTE\]/g, "</b></CITE>");
	Content = Content.replace(/\[A HREF=/g,"<A HREF=");
	Content = Content.replace(/\[YOUTUBE HREF=/g,"<IFRAME WIDTH=100% HEIGHT=360 FRAMEBORDER=0 ALLOWFULLSCREEN SRC=").replace(/\[\/YOUTUBE\]/g, "</IFRAME>");
	Content = Content.replace(/\[IMG SRC=/g,"<IMG SRC=")
	Content = Content.replace(/\[A CLASS=TH HREF=/g,"<A CLASS=TH HREF=")
	Content = Content.replace(/\[\/A\]/g, "</A>");
	Content = Content.replace(/'\]/g,"'>");
	Content = JSON.parse(Content);
	return Content;
}

internals.rss = function(){
	var request = this;
	models.BlogEntries.findAll({ where: { BlogDeleted:false}, order: 'BlogID DESC'}).success(function(rss) {
		var output = []
		for (x = 0; x < rss.length; x++){
			var output_single = {};
			output_single.BlogID = rss[x].BlogID;
			output_single.BlogTitle = rss[x].BlogTitle;
			output_single.BlogContent = internals.HTMLParse(rss[x].BlogContent)
			output_single.BlogCreateDate = moment(rss[x].BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a')
			output_single.Draft = rss[x].Draft
			output.push(output_single);
		}

		for(var posts in output) {
			feed.addItem({
				title: output[posts].BlogTitle,
				link: "http://www.endoflne.com/post/" + output[posts].BlogID,
			});
		}
		
		var rss_output = feed.render('rss-2.0');
		request.reply(rss_output);
	})
}

internals.GetBlogEntrys = function() {
	var request = this;
	var session = request.auth.credentials;
	var query
	if (request.params.id != undefined){
		query = { where: { BlogID: request.params.id, BlogDeleted:false}};
	}
	else{
		if (session){ 
			query = { where: { BlogDeleted:false}, order: 'BlogID DESC'};
		}
		else{
			query = { where: { BlogDeleted:false, Draft:false }, order: 'BlogID DESC'};
		}
	}

	models.BlogEntries.findAll(query).success(function(postResults) {
		var output = []
		for (x = 0; x < postResults.length; x++){
			var output_single = {};
            output_single.BlogID = postResults[x].BlogID;
            output_single.BlogTitle = postResults[x].BlogTitle;
            output_single.BlogContent = internals.HTMLParse(postResults[x].BlogContent)
            output_single.BlogCreateDate = moment(postResults[x].BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a')
            output_single.Draft = postResults[x].Draft
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
			output_single.CommentID = comments[x].CommentID;
            output_single.BlogID = comments[x].BlogID;
            output_single.CommentName = comments[x].CommentName;
            output_single.CommentContent = comments[x].CommentContent
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
exports.rss = internals.rss;
exports.GetComments = internals.GetComments;