var internals = {};
var db = require('./db').config;
var Sequelize = require("sequelize");
var async = require('async')
var sequelize = new Sequelize(db.db, db.user, db.password, {
  host: db.hostname
})

var ActivePosts = sequelize.define('vwAllActivePosts', {
	BlogID: { type: Sequelize.INTEGER, primaryKey: true},
	BlogTitle: Sequelize.STRING,
	BlogContent: Sequelize.STRING,
	BlogCreateDate: Sequelize.DATE,
	CommentAmount: Sequelize.INTEGER,
	TagID: Sequelize.INTEGER,
	TagName: Sequelize.STRING,
}, {
	timestamps: false,
	freezeTableName: true
})

var TagList = sequelize.define('vwAllActiveTags', {
	TagID: { type: Sequelize.INTEGER, primaryKey: true},
	TagName: Sequelize.STRING,
}, {
	timestamps: false,
	freezeTableName: true
})

var Blogs = sequelize.define('blogs', {
	BlogID: { type: Sequelize.INTEGER, primaryKey: true},
	BlogTitle: Sequelize.STRING,
	BlogContent: Sequelize.STRING,
	BlogCreateDate: Sequelize.DATE,
	BlogDeleted: Sequelize.BOOLEAN,
	AdminID: Sequelize.INTEGER,
	TagID: Sequelize.INTEGER
}, {
	timestamps: false,
	freezeTableName: true
})

var Comments = sequelize.define('comments', {
	CommentID: { type: Sequelize.INTEGER, primaryKey: true},
	BlogID: Sequelize.INTEGER,
	CommentName: Sequelize.STRING,
	CommentContent: Sequelize.STRING,
	AdminID: Sequelize.INTEGER,
	CommentCreatedDate: Sequelize.DATE,
	CommentDeleted: Sequelize.BOOLEAN
}, {
	timestamps: false,
	freezeTableName: true
})

var Tags = sequelize.define('tags', {
	TagID: { type: Sequelize.INTEGER, primaryKey: true},
	TagName: Sequelize.STRING,
	TagDeleted: Sequelize.BOOLEAN
}, {
	timestamps: false,
	freezeTableName: true
})


var GetActivePosts = function(callback,blogid){
	ActivePosts.findAll({ where: { BlogID: blogid } }).success(function(ActivePostsResults) {
		callback(ActivePostsResults);
	})
}

var GetTagList = function(callback){
	TagList.findAll().success(function(TagListResults) {
		callback(TagListResults);
	})
}

internals.PostNew = function() {
	var request = this;
	var session = request.auth.credentials;
	async.parallel([
	    function(cb){
	    	GetTagList(function(callback){	    		
	    		cb(null, callback);
			});
	    }
	],
	function(err, results){
		request.reply.view('posts/index', {tags:results[0],userid:session.adminid,userstatus:true});
	});		
}

internals.PostEdit = function() {
	var request = this;
	var session = request.auth.credentials;
	async.parallel([
 	    function(cb){
 	    	GetTagList(function(callback){	    		
 	    		cb(null, callback);
 			});
 	    },
 	    function(cb){
 	    	GetActivePosts(function(callback){	    		
 	    		cb(null, callback);
 			},request.params.id);
 	    }
 	],
 	function(err, results){
 		request.reply.view('posts/index', {tags:results[0],post:results[1],userid:session.adminid,userstatus:true});
 	});
}

internals.PostSave = function() {
	var request = this;	
	var session = request.auth.credentials;
	switch(request.payload.Type)
	{
	case "N":
		Blogs.create({ BlogTitle: request.payload.Title, BlogContent: request.payload.Content, BlogCreateDate: new Date(), BlogDeleted:0, AdminID: session.rows[0].adminid, TagID: request.payload.TagID}).success(function(userCreated) {
			request.reply.redirect('/');
		})
		break;
	case "E":
		Blogs.update({BlogTitle: request.payload.Title, BlogContent: request.payload.Content, TagID: request.payload.TagID},{BlogID: request.payload.BlogID}).success(function() {
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
	Comments.create({ BlogID: request.payload.BlogID, CommentName: request.payload.Name, CommentContent: request.payload.Comment, AdminID: adminid, CommentCreatedDate: new Date(), CommentDeleted:0}).success(function(userCreated) {
		request.reply.redirect('/post/' + request.payload.BlogID);
	})	
}

internals.Tags = function() {
	var request = this;
	var session = request.auth.credentials;
	async.parallel([
 	    function(cb){
 	    	GetTagList(function(callback){	    		
 	    		cb(null, callback);
 			});
 	    }
 	],
 	function(err, results){
 		request.reply.view('tags/index', {tags:results[0],userid:session.adminid,userstatus:true});
 	});
}

internals.TagsSave = function() {
	var request = this;	
	Tags.create({ TagName: request.payload.Tag, TagDeleted: 0}).success(function(userCreated) {
		request.reply.redirect('/tags');
	})
}

exports.PostNew = internals.PostNew;
exports.PostEdit = internals.PostEdit;
exports.PostSave = internals.PostSave;
exports.Tags = internals.Tags;
exports.CommentSave = internals.CommentSave;
exports.TagsSave = internals.TagsSave;

