var internals = {};
internals.baseuri = '';
var crypto = require('crypto');
var Sequelize = require("sequelize")
var dbconfig = require('../config/database').config;

var dbname = dbconfig.db;
var dbhostname = dbconfig.hostname;
var dbport = dbconfig.port;
var dbuser = dbconfig.user;
var dbpassword = dbconfig.password;

var mailConfig = require('../config/mail').mailconfig
var nodemailer = require("nodemailer");
var transport = nodemailer.createTransport(mailConfig.method,mailConfig.sendmail.bin);

var sequelize = new Sequelize(dbname, dbuser, dbpassword, {
    host: dbhostname,
    port: dbport,
    logging: false
});

var models = require('./models');

internals.setURI = function(input) {
        internals.baseuri = input;
}

internals.ShowLoginPage = function(request, reply) {
	reply.view('login/index');
}

internals.RegisterView = function(request, reply) {
	reply.view('register/index');
}

internals.RegisterUser = function(request, reply) {
    
	var email = request.payload.email;
	var password = request.payload.password;
	var passwordHashed = crypto.createHash('sha256').update("blog" + password + "sp").digest("hex");
	var seed = crypto.randomBytes(20);
	var verifyHash = crypto.createHash('sha256').update(seed).digest('hex');
    
	models.Users.findAndCountAll({ where: {AdminEmail: email} }).success(function(userResults) {
		if (userResults.count > 0){
			reply().redirect('/register?error-duplicate');
		}
		else{
			models.Users.create({ adminemail: email, adminpassword: passwordHashed, admindeleted: 1, ve: verifyHash}).success(function(userCreated) {
                var message = {
                        from: mailConfig.sendmail.from,
                        to: email,
                        subject: "Thanks for Registering!",
                        html: 'Thanks for registering. To verfiy your login please click <a href="' + internals.baseuri + '/confirm/' + userCreated.verifyhash +'">here</a>'
                };
                transport.sendMail(message, function(error){
                    if (error){
                        console.log(error.message);
                    } else {
                        console.log('Message sent successfully!');
                    }
                });
                reply().redirect('/?success');
			})
		}
	})
}

internals.VerifyLogin = function(request, reply) {
        var email = request.payload.email;
        var password = request.payload.password;
        var passwordHashed = crypto.createHash('sha256').update("blog" + password + "sp").digest("hex");
        models.Users.findAndCountAll( {where: {adminemail: email, adminpassword: passwordHashed, admindeleted: 0}, attributes: ['adminid', 'adminemail']}).success(function(userResults) {
                if (userResults.count > 0){
                    request.auth.session.set(userResults.rows[0].dataValues)
                    reply().redirect('/')
                }
                else{
                    reply().redirect('/login?badlogin')
                }
        })
}

internals.Confirm = function(request, reply) {
    models.Users.findAndCountAll({ where: {VerifyHash: request.params.hashkey} }).success(function(userResults) {
    	if (userResults.count > 0){
    		models.Users.update({AdminDeleted: 0},{VerifyHash: request.params.hashkey}).success(function() {
    			reply().redirect('/?confirmed')
			})			
		}
		else{
			reply().redirect('/?error')
		}
    });
}

internals.Logout = function(request, reply) {
    if (request.auth.session)
    {
		request.auth.session.clear();
	}
    reply().redirect('/')
}

exports.ShowLoginPage = internals.ShowLoginPage;
exports.RegisterView = internals.RegisterView;
exports.RegisterUser = internals.RegisterUser;
exports.VerifyLogin = internals.VerifyLogin;
exports.Logout = internals.Logout;
exports.Confirm = internals.Confirm;
exports.setURI = internals.setURI;