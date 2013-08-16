var Hapi = require('hapi');
var server = Hapi.createServer('localhost', 1234, { cors: true });

var home = require('./lib').Home;
var user = require('./lib').User;
var admin = require('./lib').Admin;


server.auth('session', {
    scheme: 'cookie',
    password: 'dfad8fasjdnf89adf', //TODO: refactor this out to gitignored auth config file
    cookie: 'blog-cookie',  //?TODO: refactor this out to gitignored auth config file
    redirectTo: '/',
	isSecure: false,
	ttl: 1800000,
	clearInvalid: true
});

server.route([
	{method: 'GET', path: '/',  config: { handler: home.GetBlogEntrys, auth: { mode: 'try' }}},
	{method: 'GET', path: '/post/{id}', config: { handler: home.GetEntry, auth: { mode: 'try' }}},
	{method: 'GET', path: '/post-new', config: {handler: admin.PostNew, auth: true}},
	{method: 'GET', path: '/post-edit', config: {handler: admin.PostEdit, auth: { mode: 'try' }}},
	{method: 'GET', path: '/tags-edit', config: {handler: admin.TagsEdit, auth: { mode: 'try' }}},
	{method: 'POST', path: '/search', config: { handler: home.EntrySearch, auth: { mode: 'try' }}},
	{method: 'GET', path: '/tags/{term}', config: { handler: home.TagSearch, auth: { mode: 'try' }}},
	{method: 'GET', path: '/archive/{year}/{month}', config: { handler: home.ArchiveSearch, auth: { mode: 'try' }}},
	{method: 'GET', path: '/login', config: { handler: user.ShowLoginPage, auth: { mode: 'try' }}},
	{method: 'POST', path: '/login/verify', config: {handler: user.VerifyLogin, auth: { mode: 'try' }}},
	{method: 'GET', path: '/logout', config: { handler: user.Logout, auth: true}},
	
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

