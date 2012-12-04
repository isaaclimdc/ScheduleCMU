$(document).ready(function() {
	var docW = $(document).width();
	if(docW <= 750) {
		$('#loginGrid').children('.ui-block-a').css('display','none');
		$('#loginGrid').children('.ui-block-b').removeClass('ui-block-b');
		$('#loginGrid').removeClass('ui-grid-b');
	}

	$('.viewswitch').click(function() {
        $('#gridview').page('refresh');
        $('#lsitview').page('refresh');
	});
});