$(document).ready(function () {
	if (window.location.search.replace("?","") == "success")
	{
		$('#register-success').foundation('reveal', 'open');
	}

	if (window.location.search.replace("?","") == "confirmed")
	{
		$('#register-confirm').foundation('reveal', 'open');
	}
	if (window.location.search.replace("?","") == "error")
	{
		$('#register-confirm-error').foundation('reveal', 'open');
	}
});