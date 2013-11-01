var internals = {};
internals.baseuri = '';
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var db = require('./db').config;

internals.setURI = function(input) {
        internals.baseuri = input;
}

var Sequelize = require("sequelize")
var sequelize = new Sequelize(db.db, db.user, db.password, {
  host: db.hostname
})


var User = sequelize.define('blogadmin', {
	adminid: { type: Sequelize.INTEGER, primaryKey: true},
	adminemail: Sequelize.STRING,
	adminpassword: Sequelize.STRING,
	admindeleted: Sequelize.BOOLEAN,
	verifyhash: Sequelize.STRING
}, 
{
	timestamps: false,
	freezeTableName: true
}
)


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

	if (email == "" || password == ""){
		request.reply.redirect('/register?error-entry');
	}
	else{
		User.findAndCountAll({ where: {adminemail: email} }).success(function(userResults) {
			if (userResults.count > 0){
				request.reply.redirect('/register?error-duplicate');
			}
			else{
				User.create({ adminemail: email, adminpassword: passwordHashed, admindeleted: 1, verifyhash: verifyHash}).success(function(userCreated) {
					var transport = nodemailer.createTransport('sendmail', '/usr/sbin/sendmail');
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
}

internals.VerifyLogin = function() {
	var request = this;
	var email = request.payload.email;
	var password = request.payload.password;
	var passwordHashed = crypto.createHash('sha256').update("blog" + password + "sp").digest("hex");
	User.findAndCountAll({ where: {adminemail: email, adminpassword: passwordHashed, admindeleted: 0} }).success(function(userResults) {
		if (userResults.count > 0){
			request.auth.session.set(userResults);
			request.reply.redirect('/');
		}
		else{
			request.reply.redirect('/login?badlogin');
		}
	})
}

internals.Confirm = function() {
    var request = this;
    User.findAndCountAll({ where: {verifyhash: request.params.hashkey} }).success(function(userResults) {
    	if (userResults.count > 0){
    		User.update({admindeleted: 0},{verifyhash: request.params.hashkey}).success(function() {
    			request.reply.redirect('/?confirmed');
			})			
		}
		else{
			request.reply.redirect('/?error');
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