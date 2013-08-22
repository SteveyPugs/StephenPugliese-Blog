$(document).ready(function () {
	if (window.location.pathname.indexOf("/post/") != -1)
	{
	var pageID = window.location.pathname.replace("/post/","");
	$('#BlogID').val(pageID);
	}

	
	//Add Comment Check
	$('#comment-save').click(function () {
		
		var name = $('#Name').val(); 
		var comment = $('#Comment').val();
		if (name.length == 0)
		{
			$('#Name').addClass("error");
			$('#Error-Name').addClass("error");
			$('#Error-Name').show();
			$('#Error-Name').text("Length of Name needs to be > 0");
		}
		else
		{
			$('#Name').removeClass("error");
			$('#Error-Name').removeClass("error");
			$('#Error-Name').hide();
			$('#Error-Name').text("");
		}
		
		if (comment.length == 0)
		{
			$('#Comment').addClass("error");
			$('#Error-Comment').addClass("error");
			$('#Error-Comment').show();
			$('#Error-Comment').text("Length of comment needs to be > 0");		
		}
		else
		{
			$('#Comment').removeClass("error");
			$('#Error-Comment').removeClass("error");
			$('#Error-Comment').hide();
			$('#Error-Comment').text("");
		}
	
		if (comment.length != 0 && name.length != 0)
		{
			return true;
		}
		else 
		{
			return false;
		}
	});	
});