$(document).ready(function () {
	$(".Content").each(function() {
		var text = $(this).text();
		text = text.replace(/\[B\]/g, "<B>");
		text = text.replace(/\[\/B\]/g, "</B>");
		text = text.replace(/\[I\]/g, "<I>");
		text = text.replace(/\[\/I\]/g, "</I>");
		text = text.replace(/\[U\]/g, "<U>");
		text = text.replace(/\[\/U\]/g, "</U>");
		text = text.replace(/\[BR\]/g, "<BR />");
		$(this).html(text);
	});
});