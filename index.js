var Hapi = require('hapi');
var server = Hapi.createServer('localhost', 1234, { cors: true });
//var server = Hapi.createServer('0.0.0.0', 1234, { cors: true, location:"http://www.endoflne.com" });  //production

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
	//Home
	{method: 'GET', path: '/',  config: { handler: home.GetBlogEntrys, auth: { mode: 'try' }}},
	
	//Pages that require Administrator
	//Views
	{method: 'GET', path: '/post-new', config: {handler: admin.PostNew, auth: true}},
	{method: 'GET', path: '/post-edit/{id}', config: {handler: admin.PostEdit, auth: true}},
	{method: 'GET', path: '/tags', config: {handler: admin.Tags, auth: true}},
	//Updates
	{method: 'POST', path: '/post-save', config: {handler: admin.PostSave, auth: true}},
	{method: 'POST', path: '/comment-save', config: {handler: admin.CommentSave, auth: true}},
	{method: 'POST', path: '/tag-save', config: {handler: admin.TagsSave, auth: true}},
	
	
	//Non-Admin Pags
	{method: 'GET', path: '/post/{id}', config: { handler: home.GetEntry, auth: { mode: 'try' }}},
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

