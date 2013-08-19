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
});