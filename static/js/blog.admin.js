$(document).ready(function () {
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
	
	
	
	// $("#text-link-up").click(function(){
		// $("#Content").surroundSelectedText("[A]", "[/A]");
	// });
	
});