var Hapi = require('hapi');
var server = Hapi.createServer('localhost', 1234, { cors: true });

var home = require('./lib').Home;


server.route([
	{method: 'GET', path: '/', handler: home.GetBlogEntrys},
	//All static content
	{method: '*', path: '/{path*}', handler: {directory: {path: './static/', listing: false, redirectToSlash:true}}}

	// {method: 'GET', path: '/GetForecast', handler: forecast.CurrentForecast},
	// {method: 'GET', path: '/GetCancelDates', handler: forecast.CurrentCancelDates},
	// {method: 'GET', path: '/GetWeather', handler: forecast.CurrentWeather},
	// {method: 'GET', path: '/SendSMS/{phonenumber}/{status}', handler: mobile.SendText},
	// {method: 'GET', path: '/GetAlternateSideSigns/{bor}/{street}/{num}', handler: data.getSigns},
]);


server.views({
    engines: {
        html: 'handlebars'            
    },
    path: './lib/views',
});

server.start(function(){
	console.log('Sever Started at: ' + server.info.uri);
});