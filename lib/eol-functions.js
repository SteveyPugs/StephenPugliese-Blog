var Sequelize = require("sequelize");
var moment = require('moment');
var config = require('../config/config').config;
var dbconfig = require('../config/database').config;
var sequelize = new Sequelize(dbconfig.db, dbconfig.user, dbconfig.password, {
    host: dbconfig.hostname,
    port: dbconfig.port,
    logging:false
});
var models = require('./models');
var EOL_Functions = {};

EOL_Functions.createPost = function(input, callback){
	var errorMessages = [];
	var title = input.title;
	var content = input.content;
	var draft = input.draft;
	var userid = input.userid;
	if(title == undefined || content == undefined || draft == undefined){
		errorMessages.push("Field Missing for Post Creation");
		callback(new Error(errorMessages));
	}
	else{
		models.BlogEntries.create({
			BlogTitle: title,
			BlogContent: content,
			BlogCreateDate: new Date(),
			BlogDeleted: false,
			AdminID: userid,
			Draft: draft
		}).success(function(post){
			callback(null, post)
		}).error(function(error){
			errorMessages.push("Error creating post");
			callback(new Error(errorMessages));
		})
	}
}

EOL_Functions.updatePost = function(input, callback){
	var errorMessages = [];
	var id = input.id;
	var title = input.title;
	var content = input.content;
	var draft = input.draft;
	if(title == undefined || content == undefined || draft == undefined || id == undefined){
		errorMessages.push("Field Missing for Post Edit");
		callback(new Error(errorMessages));
	}
	else{
		models.BlogEntries.find({
			where:{
				BlogID:id
			}
		}).success(function(post) {
			post.updateAttributes({
				BlogTitle: title,
				BlogContent: content,
				Draft: draft,
				BlogDeleted: false
			}).success(function(post) {
				callback(null, post);
			}).error(function(error){
				errorMessages.push('Cannot update post attributes');
				callback(new Error(errorMessages));
			});
		}).error(function(error){
				errorMessages.push('Cannot find post to update');
				callback(new Error(errorMessages));
		});
	}
}

EOL_Functions.getPosts = function(input, callback){
	var errorMessages = [];
	var id = input.id;
	var page = input.page;
	var userin = input.loggedin;
	if (id == undefined){
		if(page == undefined){
			if(userin == true){
				models.BlogEntries.findAll({
					where: {
						BlogDeleted:false
					},
					order: "BlogID DESC",
					limit: 2
				}).success(function(posts){
					var output = []
					for (var item in posts){
						var output_single = {};
						output_single.BlogID = posts[item].BlogID;
						output_single.BlogTitle = posts[item].BlogTitle;
						output_single.BlogContent = posts[item].BlogContent;
						output_single.BlogCreateDate = moment(posts[item].BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a');
						output_single.Draft = posts[item].Draft;
						output.push(output_single);
					}
					callback(null, output)
				}).error(function(error){
					errorMessages.push("Can not find any posts");
					callback(new Error(errorMessages));
				});
			}
			else{
				models.BlogEntries.findAll({
					where: {
						BlogDeleted:false,
						Draft: false
					},
					order: "BlogID DESC",
					limit: 2
				}).success(function(posts){
					var output = []
					for (var item in posts){
						var output_single = {};
						output_single.BlogID = posts[item].BlogID;
						output_single.BlogTitle = posts[item].BlogTitle;
						output_single.BlogContent = posts[item].BlogContent;
						output_single.BlogCreateDate = moment(posts[item].BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a');
						output_single.Draft = posts[item].Draft;
						output.push(output_single);
					}
					callback(null, output)
				}).error(function(error){
					errorMessages.push("Can not find any posts");
					callback(new Error(errorMessages));
				});
			}
		}
		else{
			if(userin == true){
				models.BlogEntries.findAll({
					where: {
						BlogDeleted:false
					},
					order: "BlogID DESC",
					limit: 2,
					offset: (page-1)*2
				}).success(function(posts){
					var output = []
					for (var item in posts){
						var output_single = {};
						output_single.BlogID = posts[item].BlogID;
						output_single.BlogTitle = posts[item].BlogTitle;
						output_single.BlogContent = posts[item].BlogContent;
						output_single.BlogCreateDate = moment(posts[item].BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a');
						output_single.Draft = posts[item].Draft;
						output.push(output_single);
					}
					callback(null, output)
				}).error(function(error){
					errorMessages.push("Can not find any posts");
					callback(new Error(errorMessages));
				});
			}
			else{
				models.BlogEntries.findAll({
					where: {
						BlogDeleted:false,
						Draft: false
					},
					order: "BlogID DESC",
					limit: 2,
					offset: (page-1)*2
				}).success(function(posts){
					var output = []
					for (var item in posts){
						var output_single = {};
						output_single.BlogID = posts[item].BlogID;
						output_single.BlogTitle = posts[item].BlogTitle;
						output_single.BlogContent = posts[item].BlogContent;
						output_single.BlogCreateDate = moment(posts[item].BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a');
						output_single.Draft = posts[item].Draft;
						output.push(output_single);
					}
					callback(null, output)
				}).error(function(error){
					errorMessages.push("Can not find any posts");
					callback(new Error(errorMessages));
				});	
			}
		}	
	}
	else{
		if(userin == true){
			models.BlogEntries.find({
				where: {
					BlogID: id,
					BlogDeleted:false
				}
			}).success(function(post){
				var output = []
				var output_single = {};
				output_single.BlogID = post.BlogID;
				output_single.BlogTitle = post.BlogTitle;
				output_single.BlogContent = post.BlogContent
				output_single.BlogCreateDate = moment(post.BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a')
				output_single.Draft = post.Draft
				output.push(output_single);
				callback(null, output)
			}).error(function(error){
				errorMessages.push("Can not find post id " + id);
				callback(new Error(errorMessages));
			});
		}
		else{
			models.BlogEntries.find({
				where: {
					BlogID: id,
					BlogDeleted:false,
					Draft: false
				}
			}).success(function(post){
				var output = []
				if(post){
					var output_single = {};
					output_single.BlogID = post.BlogID;
					output_single.BlogTitle = post.BlogTitle;
					output_single.BlogContent = post.BlogContent
					output_single.BlogCreateDate = moment(post.BlogCreateDate).format('MMMM Do YYYY, h:mm:ss a')
					output_single.Draft = post.Draft
					output.push(output_single);
					callback(null, output)
				}
				else{
					callback(null, output)
				}
				
			}).error(function(error){
				errorMessages.push("Can not find post id " + id);
				callback(new Error(errorMessages));
			});
		}	
	}
}

EOL_Functions.deletePost = function(input, callback){
	var errorMessages = [];
	var id = input.id;
	if(id == undefined){
		errorMessages.push("Must provide id to delete post");
		callback(new Error(errorMessages));
	}
	else{
		models.BlogEntries.find({
			where:{
				BlogID:id
			}
		}).success(function(post) {
			post.updateAttributes({
				BlogDeleted: true
			}).success(function(post) {
				callback(null, post);
			}).error(function(error){
				errorMessages.push('Cannot delete post');
				callback(new Error(errorMessages));
			});
		}).error(function(error){
				errorMessages.push('Cannot find post to update');
				callback(new Error(errorMessages));
		});
	}
}

EOL_Functions.getPostCount = function(input, callback){
	var errorMessages = [];
	models.BlogEntries.count({
		where:{
			BlogDeleted: false,
			Draft: false
		}
	}).success(function(postcount){
		callback(null, postcount/2)
	}).error(function(error){
		errorMessages.push("Error retrieving post count");
		callback(new Error(errorMessages));
	})
}

EOL_Functions.createComment = function(input, callback){
	var errorMessages = [];
	var name = input.name;
	var comment = input.comment;
	var blogid = input.blogid;
	var userid = input.userid;
	if(name == undefined || comment == undefined || userid == undefined || blogid == undefined){
		errorMessages.push("Field Missing for Comment Creation");
		callback(new Error(errorMessages));
	}
	else{
		models.Comments.create({
			BlogID: blogid,
			CommentName: name,
			CommentContent: comment,
			AdminID: userid,
			CommentCreatedDate: new Date(),
			CommentDeleted: false
		}).success(function(comment){
			callback(null, comment)
		}).error(function(error){
			errorMessages.push("Cannot Create Comment");
			callback(new Error(errorMessages));
		});
	}
}

EOL_Functions.getComments = function(input, callback){
	var errorMessages = [];
	var id = input.id;
	models.Comments.findAll({
		where:{
			BlogID: id,
			CommentDeleted: false
		},
		order: "CommentID"
	}).success(function(comments){
		var output = []
		for(var item in comments){
			var output_single = {};
			output_single.CommentID = comments[item].CommentID;
			output_single.BlogID = comments[item].BlogID;
			output_single.CommentName = comments[item].CommentName;
			output_single.CommentContent = comments[item].CommentContent;
			output.push(output_single);
		}
		callback(null,output)
	}).error(function(error){
		errorMessages.push("Error retrieving coments for post id " + id);
		callback(new Error(errorMessages));
	})
}

EOL_Functions.createUser = function(input, callback){
	var errorMessages = [];
	var email = input.email;
	var password = input.password;
	var hash = input.hash;
	if(email == undefined || password == undefined || hash == undefined){
		errorMessages.push("Field Missing for User Creation");
		callback(new Error(errorMessages));
	}
	else{
		models.Users.create({
			adminemail: email,
			adminpassword: password,
			admindeleted: true,
			verifyhash: hash
		}).success(function(user){
			callback(null, user)
		}).error(function(error){
			errorMessages.push("Error creating user");
			callback(new Error(errorMessages));
		})
	}
}

EOL_Functions.checkUser = function(input, callback){
	var errorMessages = [];
	var email = input.email;
	var password = input.password;
	models.Users.find({
		where:{
			adminemail: email,
			adminpassword: password,
			admindeleted: false
		},
		attributes: ['adminid', 'adminemail']
	}).success(function(user){
		callback(null,user)
	}).error(function(error){
		errorMessages.push("Error retrieving user");
		callback(new Error(errorMessages));
	})
}

EOL_Functions.confirmUser = function(input, callback){
	var errorMessages = [];
	var hash = input.hash;
	models.Users.find({
		where:{
			verifyhash: hash
		}
	}).success(function(user){
		user.updateAttributes({
			admindeleted: false,
		}).success(function(user) {
			callback(null, user);
		}).error(function(error){
			errorMessages.push('Cannot confirm user');
			callback(new Error(errorMessages));
		});
	}).error(function(error){
		errorMessages.push("Error retrieving user");
		callback(new Error(errorMessages));
	})
}

EOL_Functions.updateUser = function(input, callback){
	var errorMessages = [];
	var email = input.email;
	var password = input.password;
	if(email == undefined || password == undefined){
		errorMessages.push("Field Missing for password reset");
		callback(new Error(errorMessages));
	}
	else{
		models.Users.find({
			where:{
				adminemail: email,
				admindeleted: false
			}
		}).success(function(user) {
			user.updateAttributes({
				adminpassword: password,
				admindeleted: false
			}).success(function(user) {
				callback(null, user);
			}).error(function(user){
				errorMessages.push('Cannot update user attributes');
				callback(new Error(errorMessages));
			});
		}).error(function(error){
				errorMessages.push('Cannot find user to update');
				callback(new Error(errorMessages));
		});
	}
}

EOL_Functions.getUser = function(input, callback){
	var errorMessages = [];
	models.Users.findAll({
		where:{
			admindeleted: false
		},
		attributes: ['adminemail']
	}).success(function(users){
		callback(null,users)
	}).error(function(error){
		errorMessages.push("Error retrieving users");
		callback(new Error(errorMessages));
	})
}

EOL_Functions.getUserCount = function(input, callback){
	var errorMessages = [];
	var email = input.email;
	models.Users.count({
		where:{
			adminemail: email,
			admindeleted: false
		}
	}).success(function(count){
		callback(null,count)
	}).error(function(error){
		errorMessages.push("Error retrieving users");
		callback(new Error(errorMessages));
	})
}

module.exports = EOL_Functions;