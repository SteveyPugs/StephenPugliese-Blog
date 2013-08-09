var internals = {};

internals.ShowLoginPage = function() {
	var request = this;
	request.reply.view('login/index');
}

exports.ShowLoginPage = internals.ShowLoginPage;