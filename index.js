var Hapi = require("hapi");
var Feed = require('feed');
var AWS = require('aws-sdk');
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var Chance = require('chance');
var marked = require('marked');
var masterConfig = require("./config/config");
var serverConfig = masterConfig.config;
var requestnpm = require('request');
var fs = require("fs");
var server = new Hapi.Server(serverConfig.hostname, serverConfig.port, serverConfig.options);
var mailConfig = require('./config/mail').mailconfig;
var transport = nodemailer.createTransport(mailConfig.method,mailConfig.sendmail.bin);
var EOL_Functions = require("./lib/eol-functions");
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
AWS.config = {
	accessKeyId: serverConfig.aws_config.accessKeyId,
	secretAccessKey: serverConfig.aws_config.secretAccessKey
}
var s3 = new AWS.S3();
server.pack.require("hapi-auth-cookie", function (err) {
    server.auth.strategy("session", "cookie", "try", {
        password: "dfad8fasjdnf89adf",
        cookie: "EOL-cookie",
        redirectTo: "/",
        isSecure: false,
        ttl: 60 * 60 * 1000
    });
    server.views({
		engines: {
			html: "handlebars"            
		},
		path: "./lib/views",
		partialsPath: "./lib/views/partials"
	});
	server.route([
		{
			method:"GET",
			path: "/",
			config:{
				handler: function(request, reply){
					var pageObj = {};
					pageObj.page = 1;
					if(request.auth.credentials){
						pageObj.loggedin = true;
					}
					EOL_Functions.getPosts({
						loggedin: pageObj.loggedin
					}, function(err, posts){
						if (err) throw err;
						for(var item in posts){
							posts[item].BlogContent = marked(posts[item].BlogContent)
						}
						pageObj.posts = posts
						EOL_Functions.getPostCount({
						}, function(err, count){
							if (err) throw err;
							pageObj.pages = [];
							for (var i = 0; i <= count-1 ; i++) {
								pageObj.pages.push(i+1)
							}
							reply.view('index', pageObj);
						})
					})
				}
			}
		},
		{
			method: "GET",
			path: "/create",
			config: {
				handler: function(request, reply){
					var pictures = [];
					var pageObj = {};
					if(request.auth.credentials){
						pageObj.loggedin = true;
					}
					s3.listObjects({
						Bucket: serverConfig.aws_config.bucket
					}, function(err, data) {
						for (var item in data.Contents){
							var object = {
								pictureURL: "https://s3.amazonaws.com/EndOfLne/" + data.Contents[item].Key
							}
							pictures.push(object)
						}
						pageObj.s3 = pictures;
						reply.view('posts/index', pageObj);
					})
				},
				auth: true
			}
		},
		{
			method: "POST",
			path: "/create",
			config: {
				handler: function(request, reply){
					EOL_Functions.createPost({
						title: request.payload.Title,
						content: request.payload.Content,
						draft: request.payload.Draft,
						userid: request.auth.credentials.adminid
					}, function(err, post){
						if (err) throw err;


						fs.readFile("static/email/index.html", 'utf8', function (err,data) {
							var htmlTemplate = ""
							data = data.replace("#headline#","Engage");
							data = data.replace("#story#","A new post ""<b>"' + request.payload.Title + '"</b>"" has been created.");
							htmlTemplate = data;

							var message = {
								from: mailConfig.sendmail.from,
								to: request.auth.credentials.adminemail,
								subject: "A new post has been made - " + request.payload.Title,
								html: htmlTemplate
							}
							transport.sendMail(message, function(error){
								if(error){
									console.log(error.message)
								}
								else{
									console.log('Message sent successfully!');
								}
							})
						});
						reply().redirect("/");
					})
				},
				auth: true
			}
		},
		{
			method: "GET",
			path: "/edit/{id}",
			config: {
				handler: function(request, reply){
					var pictures = [];
					var pageObj = {};
					if(request.auth.credentials){
						pageObj.loggedin = true;
					}
					EOL_Functions.getPosts({
						id: request.params.id,
						loggedin: pageObj.loggedin
					}, function(err, post){
						pageObj.post = post;
						s3.listObjects({
							Bucket: serverConfig.aws_config.bucket
						}, function(err, data) {
							for (var item in data.Contents){
								var object = {
									pictureURL: "https://s3.amazonaws.com/EndOfLne/" + data.Contents[item].Key
								}
								pictures.push(object)
							}
							pageObj.s3 = pictures;
							reply.view('posts/index', pageObj);
						})
					})
				},
				auth: true
			}
		},
		{
			method: "POST",
			path: "/edit",
			config: {
				handler: function(request, reply){
					EOL_Functions.updatePost({
						title: request.payload.Title,
						content: request.payload.Content,
						draft: request.payload.Draft,
						id: request.payload.BlogID
					}, function(err, post){
						if (err) throw err;
						reply().redirect('/post/' + request.payload.BlogID);
					})
				},
				auth: true
			}
		},
		{
			method: "POST",
			path: "/delete",
			config: {
				handler: function(request, reply){
					EOL_Functions.deletePost({
						id: request.payload.BlogID
					}, function(err, post){
						if (err) throw err;
						reply("done")
					})
				},
				auth: true
			}
		},
		{
			method: "GET",
			path: "/post/{id}",
			config: {
				handler: function(request, reply){
					var pageObj = {};
					if(request.auth.credentials){
						pageObj.loggedin = true;
					}
					EOL_Functions.getPosts({
						id: request.params.id,
						loggedin: pageObj.loggedin
					}, function(err, post){
						if (err) throw err;
						if(post.length > 0){
							for(var item in post){
								post[item].BlogContent = marked(post[item].BlogContent)
							}
							pageObj.posts = post
							reply.view('index', pageObj);
						}
						else{
							reply().redirect("/")
						}
					})
				},
			}
		},
		{
			method: "GET",
			path: "/{page}",
			config:{
				handler: function(request, reply){
					if(!isNaN(request.params.page)){
						var pageObj = {};
						pageObj.page = request.params.page;
						if(request.auth.credentials){
							pageObj.loggedin = true;
						}
						EOL_Functions.getPosts({
							page: request.params.page,
							loggedin: pageObj.loggedin
						}, function(err, posts){
							if (err) throw err;
							for(var item in posts){
								posts[item].BlogContent = marked(posts[item].BlogContent)
							}
							pageObj.posts = posts
							EOL_Functions.getPostCount({
							}, function(err, count){
								if (err) throw err;
								pageObj.pages = [];
								for (var i = 0; i <= count-1 ; i++) {
									pageObj.pages.push(i+1)
								}
								reply.view('index', pageObj);
							})
						})
					}
					else{
						reply.view("404");
					}
					
				}
			}
		},
		{
			method: "GET",
			path: "/comment/{id}",
			config: {
				handler: function(request, reply){
					var pageObj = {};
					if(request.auth.credentials){
						pageObj.loggedin = true;
					}
					EOL_Functions.getComments({
						id: request.params.id
					}, function(err, comments){
						if (err) throw err;
						pageObj.comments = comments;
						pageObj.blogid = request.params.id;
						reply.view('comments/index', pageObj);
					})
				},
			}
		},
		{
			method: "GET",
			path: "/login",
			config: {
				handler: function(request, reply){
					if(request.auth.credentials){
						reply().redirect("/");
					}
					else{
						reply.view("login/index");
					}
				}
			}
		},
		{
			method: "POST",
			path: "/login",
			config: {
				handler: function(request, reply){
					EOL_Functions.checkUser({
						email: request.payload.email,
						password: crypto.createHash('sha256').update("blog" + request.payload.password + "sp").digest("hex")
					}, function(err, user){
						if (err) throw err;
						
						if(user){
							request.auth.session.set(user.dataValues);
							reply().redirect("/")
						}
						else{
							reply().redirect("login?badlogin")
						}
						
					})
				}
			}
		},
		{
			method: "GET",
			path: "/logout",
			config: {
				handler: function(request, reply){
					request.auth.session.clear();
					reply().redirect("/");
				}
			}
		},
		{
			method: "POST",
			path: "/comment",
			config: {
				handler: function(request, reply){
					var userid = 0;
					if(request.auth.credentials){
						userid = request.auth.credentials.adminid;
					}
					var ip = request.info.address;
					var c = request.payload.recaptcha_challenge_field;
					var r = request.payload.recaptcha_response_field;
					requestnpm({
						url: "http://www.google.com/recaptcha/api/verify",
						method: "POST",
						form: {
							privatekey: serverConfig.google_recaptcha_privatekey,
							remoteip: ip,
							challenge: c,
							response: r
						}
					}, function(err, res, body){
						if(body.indexOf("true") == -1){
							reply().redirect("/comments/" + request.payload.BlogID + "?error=captcha")
						}
						else{
							EOL_Functions.createComment({
								name: request.payload.Name,
								comment: request.payload.Comment,
								blogid: request.payload.BlogID,
								userid: userid
							}, function(err, comment){
								if (err) throw err;
								EOL_Functions.getUser({
								}, function(err, users){
									if (err) throw err;
									var output = [];
									for(var item in users){
										var output_single = {};
										output_single.email = users[item].adminemail;
										output.push(output_single);
									}
									fs.readFile("static/email/index.html", 'utf8', function (err,data) {
										var htmlTemplate = ""
										data = data.replace("#headline#","Trollers beware!");
										data = data.replace("#story#","A new comment has been posted on of our blogs. Could be a troll, who knows! Check it out <a href=http://www.endoflne.com/post/" + request.payload.BlogID + ">here");
										htmlTemplate = data;

										for(var item in output){
											var message = {
												from: mailConfig.sendmail.from,
												to: output[item].email,
												subject: "A new comment has been posted",
												html: htmlTemplate
											}
											transport.sendMail(message, function(error){
												if(error){
													console.log(error.message)
												}
												else{
													console.log('Message sent successfully!');
												}
											})
										}
									});
									reply().redirect('/comment/' + request.payload.BlogID);
								})
							})
						}
					});
				}
			}
		},
		{
			method: "GET",
			path: "/register",
			config: {
				handler: function(request, reply){
					reply.view("register/index")
				}
			},
		},
		{
			method: "POST",
			path: "/register",
			config: {
				handler: function(request, reply){
					var seed = crypto.randomBytes(20);
					var hash = crypto.createHash('sha256').update(seed).digest('hex');
					EOL_Functions.getUserCount({
						email: request.payload.email,
					}, function(err, count){
						if (err) throw err;
						if(count == 0){
							EOL_Functions.createUser({
								email: request.payload.email,
								password: crypto.createHash('sha256').update("blog" + request.payload.password + "sp").digest("hex"),
								hash: hash
							}, function(err, user){
								if (err) throw err;
								fs.readFile("static/email/index.html", 'utf8', function (err,data) {
									var htmlTemplate = ""
									data = data.replace("#headline#","You are now one of us!");
									data = data.replace("#story#","So you want to write eh? Click <a href=http://www.endoflne.com/confirm/" + user.verifyhash + ">here to complete your training!");
									htmlTemplate = data;

									var message = {
										from: mailConfig.sendmail.from,
										to: request.payload.email,
										subject: "Welcome!",
										html: htmlTemplate
									}
									transport.sendMail(message, function(error){
										if(error){
											console.log(error.message)
										}
										else{
											console.log('Message sent successfully!');
										}
									})
								});
								reply().redirect('/?success');
							})
						}
						else{
							reply().redirect('/register?error-duplicate');
						}
					})
				}
			}
		},
		{
			method: "GET",
			path: "/password",
			config: {
				handler: function(request, reply){
					reply.view("forgot/index")
				}
			},
		},
		{
			method: "POST",
			path: "/password",
			config: {
				handler: function(request, reply){
					var chance = new Chance();
					EOL_Functions.getUserCount({
						email: request.payload.email
					}, function(err, count){
						if (err) throw err;
						if(count > 0){
							var random = chance.word({length: 10})
							var password = crypto.createHash('sha256').update("blog" + random + "sp").digest("hex");
							EOL_Functions.updateUser({
								email: request.payload.email,
								password: password
							}, function(err, user){
								if (err) throw err;
								fs.readFile("static/email/index.html", 'utf8', function (err,data) {
									var htmlTemplate = ""
									data = data.replace("#headline#","Forgetful are we?");
									data = data.replace("#story#","Since you forgot your password, we've reset it for you! Your new password will be <b>" + random + "</b>. Please don't forget this one :)");
									htmlTemplate = data;

									var message = {
										from: mailConfig.sendmail.from,
										to: request.payload.email,
										subject: "Your password has been reset",
										html: htmlTemplate
									}
									transport.sendMail(message, function(error){
										if(error){
											console.log(error.message)
										}
										else{
											console.log('Message sent successfully!');
										}
										reply().redirect('/?reset');
									})
								});
							})
						}
						else{
							reply().redirect('/password?invalid')
						}
					})
				}
			},
		},
		{
			method: "GET",
			path: "/image",
			config: {
				handler: function(request, reply){
					var pageObj = {};
					if(request.auth.credentials){
						pageObj.loggedin = true;
					}
					reply.view("images/index", pageObj)
				},
				auth: true
			}
		},
		{
			method: "POST",
			path: "/image",
			config: {
				handler: function(request, reply){
					var chance = new Chance();
					s3.putObject({
						Bucket: serverConfig.aws_config.bucket,
						Key: chance.guid(),
						ACL: 'public-read',
						Body: request.payload.file._data[0]
					}, function(err,data) {
						if (err){
							console.log(err)
						}
						else{
							reply().redirect("/image?success")
						}
					});
				},
				payload:{
					output: "stream",
					parse: true
				},
				auth: true
			}
		},
		{
			method: "*",
			path: "/confirm/{hashkey}",
			config: {
				handler: function(request, reply){
					EOL_Functions.confirmUser({
						hash: request.params.hashkey
					}, function(err, user){
						if (err) throw err;
						if (err){
							reply().redirect('/?error')
						}
						else{
							reply().redirect('/?confirmed')	
						}
					})
				}
			}
		},
		{
			method: "GET",
			path: "/rss",
			config: {
				handler: function(request, reply){
					EOL_Functions.getPosts({
					}, function(err, posts){
						if (err) throw err;
						for(var item in posts){
							feed.addItem({
								title: posts[item].BlogTitle,
								link: "http://www.endoflne.com/post/" + posts[item].BlogID,
							})
						}
						var rss_output = feed.render('rss-2.0');
						reply(rss_output);
					})
				}
			}
		},
		{
			method: "POST",
			path: "/markdown",
			config:{
				handler: function(request, reply){
					reply(marked(request.payload.content));
				}
			}
		},
		{
			method: "*",
			path: "/{path*}",
			config: {
				handler: {
					directory: {
						path: "./static/",
						listing: false,
						redirectToSlash:true
					}
				}
			}
		}
	])
	server.ext('onPreResponse', function (request, reply) {
		var response = request.response
		if (!response.isBoom) {
			return reply()
		}
		var error = response
		reply.view('404')
	})
	server.start();
});