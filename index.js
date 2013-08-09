var Hapi = require('hapi');
var server = Hapi.createServer('localhost', 1234, { cors: true });

var home = require('./lib').Home;
var user = require('./lib').User;


server.route([
	{method: 'GET', path: '/', handler: home.GetBlogEntrys},
	{method: 'GET', path: '/post/{id}', handler: home.GetEntry},
	{method: 'GET', path: '/login', handler: user.ShowLoginPage},
	//All static content
	{method: '*', path: '/{path*}', handler: {directory: {path: './static/', listing: false, redirectToSlash:true}}}
]);


server.views({
    engines: {
        html: 'handlebars'            
    },
    path: './lib/views',
	partialsPath: './lib/views/partials'
});

server.on('internalError', function (request, err) {
    console.log('Error response (500) sent for request: ' + request.id + ' because: ' + err.message);
});

server.start(function(){
	console.log('Sever Started at: ' + server.info.uri);
});

