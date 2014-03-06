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
		postContent = postContent.replace(/\[BLOCKQUOTE\]/g, "<CITE><b>");
		postContent = postContent.replace(/\[\/BLOCKQUOTE\]/g, "</b></CITE>");
		postContent = postContent.replace(/\[A HREF=/g,"<A HREF=");
		postContent = postContent.replace(/\[A CLASS=TH HREF=/g,"<A CLASS=TH HREF=");
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
	
	$("#image").click(function(src){
		var src = prompt("Paste Link Here");
		if (src != "")
		{
			$("#Content").surroundSelectedText("[A CLASS=TH HREF='" + src + "'][IMG SRC='" + src + "']", "[/A]");
		}
		else
		{
			alert("Link can't be blank!");
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

	$("#text-correction").click(function(){
		console.log("Check Me")
		AtD.checkTextAreaCrossAJAX("Content", "text-correction", "TURN OFF SPELLING & GRAMMAR");
	})

	$("#image-upload-insert").click(function(){
		$("#PictureFrames").slideToggle()
	})

	$("a.delete").click(function(){
		$.ajax({
			url: '/post/' + $(this).attr("id"),
			type: 'DELETE',
			success: function(result) {
				location.reload();
			}
		});
	});
});

function chooseIMG(src){
	$("#Content").surroundSelectedText("[A CLASS=TH HREF='" + src + "'][IMG SRC='" + src + "']", "[/A]");
}