var internals = {}

var config = require('../config/config').config;

var dbconfig = require('../config/database').config
var dbname = dbconfig.db
var dbhostname = dbconfig.hostname
var dbport = dbconfig.port
var dbuser = dbconfig.user
var dbpassword = dbconfig.password

var req = require('request');
var Chance = require('chance');


var mailConfig = require('../config/mail').mailconfig
var nodemailer = require("nodemailer");
var transport = nodemailer.createTransport(mailConfig.method,mailConfig.sendmail.bin);

var Sequelize = require("sequelize");

var sequelize = new Sequelize(dbname, dbuser, dbpassword, {
    host: dbhostname,
    port: dbport
});

var models = require('./models');
var AWS = require('aws-sdk');
AWS.config = {
	accessKeyId: config.aws_config.accessKeyId,
	secretAccessKey: config.aws_config.secretAccessKey
}
var s3 = new AWS.S3(); 




internals.PostNew = function(request, reply) {
	var session = request.auth.credentials;
	var pictures = [];

	s3.listObjects({
		Bucket: config.aws_config.bucket
	}, function(err, data) {
		for (var item in data.Contents){
			var object = {
				pictureURL: "https://s3.amazonaws.com/EndOfLne/" + data.Contents[item].Key
			}
			pictures.push(object)
		}
		reply.view('posts/index', {userid:session.adminid,userstatus:true,s3:pictures});
	})
}



internals.ImagesView = function(request, reply) {
	var session = request.auth.credentials;
	reply.view('images/index', {userid:session.adminid,userstatus:true});
}


internals.Upload = function(request, reply) {	
	console.log(request.raw)
	//var chance = new Chance();
	//var randomString = chance.guid()
	//s3.putObject({
	//	Bucket: config.aws_config.bucket,
	//	Key: request.payload.image,
	//	ACL: 'public-read',
	//	Body: request.payload._readableState.buffer[0]
	//}, function() {
	//	console.log("Successfully uploaded data!");
	//});

}

internals.PostEdit = function(request, reply) {
	var session = request.auth.credentials;

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
		reply.view('posts/index', entries);
	})
}

internals.PostSave = function(request, reply) {
	var session = request.auth.credentials;
	
	switch(request.payload.Type)
	{
	case "N":
		models.BlogEntries.create({BlogTitle: request.payload.Title, BlogContent: request.payload.Content, BlogCreateDate: new Date(), BlogDeleted:0, AdminID: session.adminid, Draft: request.payload.Draft}).success(function(postCreated) {
            var message = {
            	from: mailConfig.sendmail.from,
            	to: session.adminemail,
            	subject: "New Post - " + request.payload.Title,
            	html: 'A new post has been made titled <b>"' + request.payload.Title + '"</b>. If it is a Draft then it will not appear in the blog entry list until you move it to a non draft status. <a href="http://www.endoflne.com/post/' + postCreated.null + '">Click here</a> to view the post.'
            };

			transport.sendMail(message, function(error){
				if (error){
					console.log(error.message);
				}
				else {
					console.log('Message sentsuccessfully!');
				}
			});

			reply().redirect('/');
		})
		break;
	case "E":
		models.BlogEntries.update({BlogTitle: request.payload.Title, BlogContent: request.payload.Content, Draft: request.payload.Draft},{BlogID: request.payload.BlogID}).success(function() {
    		reply().redirect('/post/' + request.payload.BlogID);
		})
		break;
	}
}

internals.CommentSave = function(request, reply) {

	var session = request.auth.credentials;
	var adminid = 0;
	if (session != undefined){
		adminid = session.adminid
	}

	var remoteIP = request.info.address;
	var challenge = request.payload.recaptcha_challenge_field;
	var response = request.payload.recaptcha_response_field;

	var requestOptions = {
		url: "http://www.google.com/recaptcha/api/verify",
		method:"POST",
		form: {
			privatekey:config.google_recaptcha_privatekey,
			remoteip:remoteIP,
			challenge:challenge,
			response:response
		}
	}
	
	req(requestOptions, function(error,response,body){
		if(body.indexOf("true") != -1){
			models.Comments.create({ BlogID: request.payload.BlogID, CommentName: request.payload.Name, CommentContent: request.payload.Comment, AdminID: adminid, CommentCreatedDate: new Date(), CommentDeleted:0}).success(function(userCreated) {
				models.Users.findAll({ where: { admindeleted:false }}).success(function(usersList) {
					var output = []
					for (x = 0; x < usersList.length; x++){
						var output_single = {};
						output_single.email = usersList[x].adminemail;
						output.push(output_single);
					}

					for (x = 0; x < output.length; x++){
						var message = {
			            	from: mailConfig.sendmail.from,
			            	to: output[x].email,
			            	subject: "New Comment",
			            	html: 'A new comment has been made on <a href="http://www.endoflne.com/post/' + request.payload.BlogID + '">this post</a>.'
			            };

						transport.sendMail(message, function(error){
							if (error){
								console.log(error.message);
							}
							else {
								console.log('Message sentsuccessfully!');
							}
						});
					}
					reply().redirect('/post/' + request.payload.BlogID);
				})
			})	
		}
		else{
			reply().redirect("/comments/" + request.payload.BlogID + "?error=captcha")
		}
	})
}

exports.PostNew = internals.PostNew;
exports.PostEdit = internals.PostEdit;
exports.PostSave = internals.PostSave;
exports.Upload = internals.Upload;
exports.ImagesView = internals.ImagesView;
exports.CommentSave = internals.CommentSave;