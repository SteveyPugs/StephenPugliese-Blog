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

var ActivePostsWithTags = sequelize.define('vwAllActivePostsWithTag', {
	BlogID: { type: Sequelize.INTEGER, primaryKey: true},
	BlogTitle: Sequelize.STRING,
	BlogContent: Sequelize.STRING,
	BlogCreateDate: Sequelize.DATE,
	TagName: Sequelize.STRING,
	CommentAmount: Sequelize.INTEGER,
}, {
	timestamps: false,
	freezeTableName: true
})

var ActiveComments = sequelize.define('vwAllActiveComments', {
	CommentID: { type: Sequelize.INTEGER, primaryKey: true},
	BlogID: Sequelize.INTEGER,
	CommentName: Sequelize.STRING,
	CommentContent: Sequelize.STRING,
	AdminID: Sequelize.INTEGER,
	CommentCreatedDate: Sequelize.DATE,
	CommentDeleted: Sequelize.BOOLEAN,
}, {
	timestamps: false,
	freezeTableName: true
})

var ArchiveList = sequelize.define('vwArchiveList', {
	BlogYear: { type: Sequelize.STRING, primaryKey: true},
	BlogMonth: Sequelize.STRING,
	BlogMonthNum: Sequelize.STRING,
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

var GetActivePosts = function(callback,blogid,search){
	var queryObj;
	if (blogid != undefined){
		queryObj = { where: { BlogID: blogid } };	
	}
	if (search != undefined){
		console.log(search);
		queryObj = { where: ["BlogContent LIKE '%" + search + "%'"] };
		
	}	
	ActivePosts.findAll(queryObj).success(function(ActivePostsResults) {
		callback(ActivePostsResults);
	})
}

var GetActivePostsWithTags = function(callback,tag){
	ActivePostsWithTags.findAll({ where: ["TagName LIKE '%" + tag + "%'"] }).success(function(ActivePostsWithTagResults) {
		callback(ActivePostsWithTagResults);
	})
}

var GetActiveComments = function(callback,blogid){
	ActiveComments.findAll({ where: { BlogID: blogid } }).success(function(ActiveCommentsResults) {
		callback(ActiveCommentsResults);
	})
}

var GetTagList = function(callback){
	TagList.findAll().success(function(TagListResults) {
		callback(TagListResults);
	})
}

internals.GetBlogEntrys = function() {
	var request = this;
	var session = request.auth.credentials;
	async.parallel([
	    function(cb){
	    	GetActivePosts(function(callback){	    		
	    		cb(null, internals.HTMLParse(callback));
			},null,null);
	    },
	    function(cb){
	    	GetTagList(function(callback){	    		
	    		cb(null, callback);
			});
	    }
	],
	
	function(err, results){
		if (session){ 
			posts = {entries:results[0],userstatus:true,tags:results[1],userid:session.adminid};
		}
		else{
			posts = {entries:results[0],userstatus:false,tags:results[1]};	
		}
		request.reply.view('index', posts);
	});
}

internals.GetEntry = function() {
	var request = this;
	var session = request.auth.credentials;
	async.parallel([
	    function(cb){
	    	GetActivePosts(function(callback){	    		
	    		cb(null, internals.HTMLParse(callback));
			},request.params.id,null);
	    },
	    function(cb){
	    	GetTagList(function(callback){	    		
	    		cb(null, callback);
			});
	    },
	    function(cb){
	    	GetActiveComments(function(callback){	    		
	    		cb(null, internals.HTMLParse(callback));
			},request.params.id);
	    },
	],
	
	function(err, results){
		if (session){ 
			posts = {entries:results[0],userstatus:true,tags:results[1],comments:results[2],newcomment:true,userid:session.adminid};
		}
		else{
			posts = {entries:results[0],userstatus:false,tags:results[1],comments:results[2],newcomment:true};	
		}
		request.reply.view('index', posts);
	});	
}

internals.EntrySearch = function() {
	var request = this;
	var session = request.auth.credentials;
	async.parallel([
	    function(cb){
	    	GetActivePosts(function(callback){	    		
	    		cb(null, internals.HTMLParse(callback));
			},null,request.payload.SearchTerm);

	    },
	    function(cb){
	    	GetTagList(function(callback){	    		
	    		cb(null, callback);
			});
	    }
	],
	function(err, results){
		if (session){ 
			posts = {entries:results[0],userstatus:true,tags:results[1],search:request.payload.SearchTerm,userid:session.adminid};
		}
		else{
			posts = {entries:results[0],userstatus:false,tags:results[1],search:request.payload.SearchTerm};	
		}
		request.reply.view('index', posts);
	});
}

internals.TagSearch = function() {
	var request = this;
	var session = request.auth.credentials;
	async.parallel([
	    function(cb){
	    	GetActivePostsWithTags(function(callback){	    		
	    		cb(null, internals.HTMLParse(callback));
			},request.params.term);

	    },
	    function(cb){
	    	GetTagList(function(callback){	    		
	    		cb(null, callback);
			});
	    }
	],
	function(err, results){
		if (session){ 
			posts = {entries:results[0],userstatus:true,tags:results[1],tagname:request.params.term,userid:session.adminid};
		}
		else{
			posts = {entries:results[0],userstatus:false,tags:results[1],tagname:request.params.term};	
		}
		request.reply.view('index', posts);
	});	
}


exports.GetBlogEntrys = internals.GetBlogEntrys;
exports.GetEntry = internals.GetEntry;
exports.EntrySearch = internals.EntrySearch;
exports.TagSearch = internals.TagSearch;