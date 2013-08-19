$(document).ready(function () {
	//https://code.google.com/p/rangyinputs/wiki/Documentation
	$('#Error-Title').hide();
	$('#Error-Content').hide();

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
			$('#Error-Title').show();
			$('#Error-Title').text("Length of Title needs to be > 0");
		}
		else
		{
			$('#Title').removeClass("error");
			$('#Error-Title').hide();
			$('#Error-Title').text("");
		}
		
		if (content.length == 0)
		{
			$('#Content').addClass("error");
			$('#Error-Content').show();
			$('#Error-Content').text("Length of Content needs to be > 0");		
		}
		else
		{
			$('#Content').removeClass("error");
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
});