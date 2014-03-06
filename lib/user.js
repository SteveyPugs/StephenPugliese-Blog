var internals = {};
var crypto = require('crypto');
var nodemailer = require("nodemailer");
var Sequelize = require("sequelize")
var models = require('./models');
var Chance = require('chance');
var dbconfig = require('../config/database').config;
var mailConfig = require('../config/mail').mailconfig

var transport = nodemailer.createTransport(mailConfig.method,mailConfig.sendmail.bin);
var sequelize = new Sequelize(dbconfig.db, dbconfig.user, dbconfig.password, {
    host: dbconfig.hostname,
    port: dbconfig.port
});


internals.ShowLoginPage = function(request, reply) {
	reply.view('login/index');
}

internals.RegisterView = function(request, reply) {
	reply.view('register/index');
}

internals.ForgotView = function(request, reply) {
    reply.view('forgot/index');
}

internals.ResetPassword = function(request, reply) {
    var chance = new Chance();
    
    models.Users.findAndCountAll({where: {adminemail: request.payload.email, admindeleted: 0}}).success(function(results) {
        if (results.count > 0){
            var randomword = chance.word({length: 10})
            var passwordHashed = crypto.createHash('sha256').update("end" + randomword + "line").digest("hex");
            models.Users.update({adminpassword: passwordHashed},{adminid: results.rows[0].adminid}).success(function() {
        
                var message = {
                    from: mailConfig.sendmail.from,
                    to: results.rows[0].adminemail,
                    subject: "Your password has been reset",
                    html: 'Youre password has been successfully reset. If you did not reset your password please contact support at stephen.pugliese@outlook.com. Your new password is: <b>"' + randomword + '"</b>.'
                };

                transport.sendMail(message, function(error){
                    if (error){
                        console.log(error.message);
                    }
                    else {
                        console.log('Message sent successfully!');
                        reply().redirect('/?reset');
                    }
                });

                
            })
        }
        else{
            reply().redirect('/forgot?invalid')
        }
    })


    
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
            models.Users.create({ adminemail: email, adminpassword: passwordHashed, admindeleted: 1, verifyhash: verifyHash}).success(function(userCreated) {
                var message = {
                        from: mailConfig.sendmail.from,
                        to: email,
                        subject: "Thanks for Registering!",
                        html: 'Thanks for registering. To verfiy your login please click <a href="http://www.endoflne.com/confirm/' + userCreated.verifyhash +'">here</a>'
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
    models.Users.findAndCountAll({ where: {verifyhash: request.params.hashkey} }).success(function(userResults) {
    	if (userResults.count > 0){
    		models.Users.update({admindeleted: 0},{verifyhash: request.params.hashkey}).success(function() {
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
exports.ForgotView = internals.ForgotView;
exports.RegisterUser = internals.RegisterUser;
exports.ResetPassword = internals.ResetPassword;
exports.VerifyLogin = internals.VerifyLogin;
exports.Logout = internals.Logout;
exports.Confirm = internals.Confirm;