$(document).ready(function () {
	
	
	
	function showPreview(postContent) {
		postContent = postContent.replace(/\[B\]/g, "<B>");
		postContent = postContent.replace(/\[\/B\]/g, "</B>");
		postContent = postContent.replace(/\[I\]/g, "<I>");
		postContent = postContent.replace(/\[\/I\]/g, "</I>");
		postContent = postContent.replace(/\[U\]/g, "<U>");
		postContent = postContent.replace(/\[\/U\]/g, "</U>");
		postContent = postContent.replace(/\[BR\]/g, "<BR />");
		postContent = postContent.replace(/\[QUOTE\]/g, "&quot;");
		postContent = postContent.replace(/\[\/QUOTE\]/g, "&quot;");
		postContent = postContent.replace(/\[BLOCKQUOTE\]/g, "<BLOCKQUOTE>");
		postContent = postContent.replace(/\[\/BLOCKQUOTE\]/g, "</BLOCKQUOTE>");
		postContent = postContent.replace(/\[A HREF=/g,"<A HREF=");
		postContent = postContent.replace(/\[\/A\]/g, "</A>");
		postContent = postContent.replace(/\[YOUTUBE HREF=/g,"<IFRAME WIDTH=100% HEIGHT=360 FRAMEBORDER=0 ALLOWFULLSCREEN SRC=");
		postContent = postContent.replace(/\[\/YOUTUBE\]/g, "</IFRAME>");
		postContent = postContent.replace(/\[IMG SRC=/g,"<IMG SRC=");
		postContent = postContent.replace(/'\]/g,"'>");
		return postContent;
		}
		
//https://code.google.com/p/rangyinputs/wiki/Documentation

	$("#text-bold").click(function(){
		$("#Content").surroundSelectedText("[B]", "[/B]");
	});
	
	$("#text-italic").click(function(){
		$("#Content").surroundSelectedText("[I]", "[/I]");
	});
	
	$("#text-underline").click(function(){
		$("#Content").surroundSelectedText("[U]", "[/U]");
	});
	
	$("#text-break").click(function(){
		$("#Content").replaceSelectedText("[BR]", "collapseToEnd");
	});
	
	$("#text-quotes").click(function(){
		$("#Content").surroundSelectedText("[QUOTE]", "[/QUOTE]");
	});	
	
	$("#text-blockquote").click(function(){
		$("#Content").surroundSelectedText("[BLOCKQUOTE]", "[/BLOCKQUOTE]");
	});
	
	$("#text-link-up").click(function(){
		var linkhref = prompt("Paste Link Here");
		if (linkhref != "")
		{
			$("#Content").surroundSelectedText("[A HREF='" + linkhref + "']", "[/A]");
		}
		else
		{
			alert("Link can't be blank!");
		}	
	});
	
	$("#video-youtube").click(function(){
		var src = prompt("Enter Youtube Link");
		if (src != "")
		{
			$("#Content").surroundSelectedText("[YOUTUBE HREF='" + src + "']", "[/YOUTUBE]");
		}
		else
		{
			alert("Link can't be blank!");
		}	
	});
	
	$("#image").click(function(){
		var src = prompt("Paste Link Here");
		if (src != "")
		{
			$("#Content").replaceSelectedText("[IMG SRC='" + src + "']", "collapseToEnd");
		}
		else
		{
			alert("Link can't be blank!");
		}
	});
	
	//Add Edit Page Check
	$('#post-save').click(function () {
		
		var title = $('#Title').val(); 
		var content = $('#Content').val();
		
		if (title.length == 0)
		{
			$('#Title').addClass("error");
			$('#Error-Title').addClass("error");
			$('#Error-Title').show();
			$('#Error-Title').text("Length of Title needs to be > 0");
		}
		else
		{
			$('#Title').removeClass("error");
			$('#Error-Title').removeClass("error");
			$('#Error-Title').hide();
			$('#Error-Title').text("");
		}
		
		if (content.length == 0)
		{
			$('#Content').addClass("error");
			$('#Error-Content').addClass("error");
			$('#Error-Content').show();
			$('#Error-Content').text("Length of Content needs to be > 0");		
		}
		else
		{
			$('#Content').removeClass("error");
			$('#Error-Content').removeClass("error");
			$('#Error-Content').hide();
			$('#Error-Content').text("");
		}
	
		if (content.length != 0 && title.length != 0) {
			return true;
		}
		else {
			return false;
		}
	});	
	$('#post-preview-code').click(function () {
		
		if ($('#post-preview-code').text() == "PREVIEW")
		{
			var postContent = $('#Content').val();
			$('#post-preview-code').text("CODE");
			$('#preview-window').show();
			$('#Content').hide();
			$('#preview-window').html(showPreview(postContent));
		}
		else
		{
			$('#post-preview-code').text("PREVIEW");
			$('#preview-window').hide();
			$('#Content').show();
		}
	});
});