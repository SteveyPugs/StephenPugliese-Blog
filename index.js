var Hapi = require("hapi");
var masterConfig = require("./config/config");
var serverConfig = masterConfig.config;
var server = new Hapi.Server(serverConfig.hostname, serverConfig.port, serverConfig.options);

var home = require("./lib").Home;
var user = require("./lib").User;
var admin = require("./lib").Admin;

server.pack.require("hapi-auth-cookie", function (err) {

    server.auth.strategy("session", "cookie", {
        password: "dfad8fasjdnf89adf",
        cookie: "EOL-cookie",
        redirectTo: "/login",
        isSecure: false,
        ttl: 24 * 60 * 60 * 1000
    });
	
	server.route([
		{
			method: "GET",
			path: "/",
			config: {
				handler: home.GetBlogEntrys,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "GET",
			path: "/{page}",
			config: {
				handler: home.GetBlogEntrys,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "GET",
			path: "/post/{id}",
			config: {
				handler: home.GetBlogEntrys,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "GET",
			path: "/comments/{id}",
			config: {
				handler: home.GetComments,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "GET",
			path: "/rss",
			config: {
				handler: home.rss,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "GET",
			path: "/post-new",
			config: {
				handler: admin.PostNew,
				auth: true
			}
		},
		{
			method: "GET",
			path: "/post-edit/{id}",
			config: {
				handler: admin.PostEdit,
				auth: true
			}
		},
		{
			method: "POST",
			path: "/post-save",
			config: {
				handler: admin.PostSave,
				auth: true
			}
		},
		{
			method: "POST",
			path: "/comment-save",
			config: {
				handler: admin.CommentSave,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "POST",
			path: "/upload",
			config: {
				handler: admin.Upload,
				payload: {
					output: "stream",
					parse: true
				},
				auth: true
			}
		},
		{
			method: "GET",
			path: "/login",
			config: {
				handler: user.ShowLoginPage,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "GET",
			path: "/register",
			config: {
				handler: user.RegisterView,
				auth: {
					mode: "try"
				}
			}
		},
		{
			method: "POST",
			path: "/register",
			config: {
				handler: user.RegisterUser
			}
		},
		{
			method: "POST",
			path: "/login/verify",
			config: {
				handler: user.VerifyLogin,
				auth: {
					mode: "try" 
				}
			}
		},
		{
			method: "GET",
			path: "/logout",
			config: {
				handler: user.Logout,
				auth: true
			}
		},
		{
			method: "*",
			path: "/confirm/{hashkey*}",
			config: {
				handler: user.Confirm,
				auth: false
			}
		},
		{
			method: "*",
			path: "/{path*}",
			handler: {
				directory: {
					path: "./static/",
					listing: false,
					redirectToSlash:true
				}
			}
		}
	])

	server.views({
		engines: {
			html: "handlebars"            
		},
		path: "./lib/views",
		partialsPath: "./lib/views/partials"
	});


	server.ext('onPreResponse', function (request, reply) {
		var response = request.response
		if (!response.isBoom) {
			return reply()
		}
		var error = response
		var ctx = {
			message: (error.output.statusCode === 404 ? 'page not found' : 'something went wrong')
		}
		reply.view('404', ctx)
	})




	server.start();
});