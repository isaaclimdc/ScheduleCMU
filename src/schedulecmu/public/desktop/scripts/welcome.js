$(document).ready(function() {
	$("#videowrapper").fitVids();
	var footheight = $('#footer').height();
	if($(document).height() > $(window).height()) {
		$('#footer').height(footheight + $(document).height() - $(window).height());
	}
	else {
		$('#footer').height(footheight + $(window).height() - $(document).height());
	}
});