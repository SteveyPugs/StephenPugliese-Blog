$(document).ready(function () {
	if (window.location.pathname.indexOf("/post/") != -1)
	{
	var pageID = window.location.pathname.replace("/post/","");
	$('#BlogID').val(pageID);
	}
	
	$('#Error-Name').hide();
	$('#Error-Comment').hide();

	$(".Content").each(function() {
		var text = $(this).text();
		text = text.replace(/\[B\]/g, "<B>");
		text = text.replace(/\[\/B\]/g, "</B>");
		text = text.replace(/\[I\]/g, "<I>");
		text = text.replace(/\[\/I\]/g, "</I>");
		text = text.replace(/\[U\]/g, "<U>");
		text = text.replace(/\[\/U\]/g, "</U>");
		text = text.replace(/\[BR\]/g, "<BR />");
		text = text.replace(/\[QUOTE\]/g, "&quot;");
		text = text.replace(/\[\/QUOTE\]/g, "&quot;");
		text = text.replace(/\[A HREF=/g,"<A HREF=");
		text = text.replace(/\[\/A\]/g, "</A>");
		text = text.replace(/\[YOUTUBE HREF=/g,"<IFRAME WIDTH=100% HEIGHT=360 FRAMEBORDER=0 ALLOWFULLSCREEN SRC=");
		text = text.replace(/\[\/YOUTUBE\]/g, "</A>");
		text = text.replace(/\[IMG SRC=/g,"<IMG SRC=")
		text = text.replace(/\]/g,">");
		$(this).html(text);
	});
	
	
	//Add Comment Check
	$('#comment-save').click(function () {
		
		var name = $('#Name').val(); 
		var comment = $('#Comment').val();
		if (name.length == 0)
		{
			$('#Name').addClass("error");
			$('#Error-Name').show();
			$('#Error-Name').text("Length of Name needs to be > 0");
		}
		else
		{
			$('#Name').removeClass("error");
			$('#Error-Name').hide();
			$('#Error-Name').text("");
		}
		
		if (comment.length == 0)
		{
			$('#Comment').addClass("error");
			$('#Error-Comment').show();
			$('#Error-Comment').text("Length of comment needs to be > 0");		
		}
		else
		{
			$('#Comment').removeClass("error");
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