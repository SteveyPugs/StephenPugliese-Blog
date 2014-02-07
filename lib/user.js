var internals = {};
internals.baseuri = '';
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var Sequelize = require("sequelize")
var dbconfig = require('../config/database').config;

var dbname = dbconfig.db;
var dbhostname = dbconfig.hostname;
var dbport = dbconfig.port;
var dbuser = dbconfig.user;
var dbpassword = dbconfig.password;

var sequelize = new Sequelize(dbname, dbuser, dbpassword, {
    host: dbhostname,
    port: dbport,
    logging: false
});

var models = require('./models');

internals.setURI = function(input) {
        internals.baseuri = input;
}

internals.ShowLoginPage = function() {
	var request = this;
	request.reply.view('login/index');
}

internals.RegisterView = function() {
	var request = this;
	request.reply.view('register/index');
}

internals.RegisterUser = function() {
	var request = this;
	var email = request.payload.email;
	var password = request.payload.password;
	var passwordHashed = crypto.createHash('sha256').update("blog" + password + "sp").digest("hex");
	var seed = crypto.randomBytes(20);
	var verifyHash = crypto.createHash('sha256').update(seed).digest('hex');

	models.Users.findAndCountAll({ where: {AdminEmail: email} }).success(function(userResults) {
		if (userResults.count > 0){
			request.reply.redirect('/register?error-duplicate');
		}
		else{
			models.Users.create({ AdminEmail: email, AdminPassword: passwordHashed, AdminDeleted: 1, VerifyHash: verifyHash}).success(function(userCreated) {
				var transport = nodemailer.createTransport('sendmail');
                var message = {
                        from: '"End Of Line Administration " <no-reply@endoflne.com>',
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
                request.reply.redirect('/?success');
			})
		}
	})
}

internals.VerifyLogin = function() {
        var request = this;
        var email = request.payload.email;
        var password = request.payload.password;
        var passwordHashed = crypto.createHash('sha256').update("blog" + password + "sp").digest("hex");
        models.Users.findAndCountAll( {where: {adminemail: email, adminpassword: passwordHashed, admindeleted: 0}, attributes: ['adminid', 'adminemail']}).success(function(userResults) {
                if (userResults.count > 0){
                        request.auth.session.set(userResults.rows[0].dataValues)
                        request.reply.redirect('/')
                }
                else{
                        request.reply.redirect('/login?badlogin')
                }
        })
}

internals.Confirm = function() {
    var request = this;
    models.Users.findAndCountAll({ where: {VerifyHash: request.params.hashkey} }).success(function(userResults) {
    	if (userResults.count > 0){
    		models.Users.update({AdminDeleted: 0},{VerifyHash: request.params.hashkey}).success(function() {
    			request.reply.redirect('/?confirmed')
			})			
		}
		else{
			request.reply.redirect('/?error')
		}
    });
}

internals.Logout = function() {
	var request = this;
    if (this.auth.session)
    {
		this.auth.session.clear();
	}
    request.reply.redirect('/')
}

exports.ShowLoginPage = internals.ShowLoginPage;
exports.RegisterView = internals.RegisterView;
exports.RegisterUser = internals.RegisterUser;
exports.VerifyLogin = internals.VerifyLogin;
exports.Logout = internals.Logout;
exports.Confirm = internals.Confirm;
exports.setURI = internals.setURI;