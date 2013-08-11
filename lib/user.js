var internals = {};
var mysql = require('mysql');
var crypto = require('crypto');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'xxxxxxxxx',
  password : 'xxxxxxxxx',
  database : 'xxxxxxxxx',
});

internals.ShowLoginPage = function() {
	var request = this;
	request.reply.view('login/index');
}

internals.VerifyLogin = function() {
	var request = this;
	var email = request.payload.email;
	var password = request.payload.password;
	var passwordHashed = crypto.createHash('sha256').update("blog" + password + "sp").digest("hex");
		
	connection.query("SELECT adminid FROM blogadmin WHERE adminemail = " + mysql.escape(email) + " AND adminpassword = " + mysql.escape(passwordHashed) + " AND admindeleted <> 1 LIMIT 1;", function(err, results) {
	
		if (results.length != 0)
		{
			var user = results[0];
			console.log(user["adminid"]);
			request.auth.session.set(results[0]);
			request.reply.redirect('/');
		}
		else
		{
			request.reply.redirect('/login?badlogin');
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
exports.VerifyLogin = internals.VerifyLogin;
exports.Logout = internals.Logout;
