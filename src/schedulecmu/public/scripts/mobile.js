$(document).ready(function() {
	var docW = $(document).width();
	if(docW <= 750) {
		$('#loginGrid').children('.ui-block-a').css('display','none');
		$('#loginGrid').children('.ui-block-b').removeClass('ui-block-b');
		$('#loginGrid').removeClass('ui-grid-b');
	}

	$('#listview').bind('pageshow', function() {
        console.log('List View');
        $.mobile.changePage('#listview', {
	        allowSamePageTransition: true,
	        transition: 'none',
	        reloadPage: true
	    });
    });

    $('#gridview').bind('pageshow', function() {
        console.log('Grid View');
        $.mobile.changePage('#gridview', {
	        allowSamePageTransition: true,
	        transition: 'none',
	        reloadPage: true
	    });
    });
});