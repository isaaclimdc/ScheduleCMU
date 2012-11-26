$(document).ready(function() {
	var docW = $(document).width();
	if(docW <= 750) {
		$('#loginGrid').children('.ui-block-a').css('display','none');
		$('#loginGrid').children('.ui-block-b').removeClass('ui-block-b');
		$('#loginGrid').removeClass('ui-grid-b');
	}

    var docH = $('#gridview').height();
    console.log(docH);
    $('#calview').fullCalendar({
        theme: false,
        header: false,
        weekends: false,
        allDaySlot: false,
        minTime: 8,
        contentHeight: docH,
        defaultView: 'agendaWeek',
        editable: false,
        columnFormat: {
            month: 'dddd',
            week: 'dddd',
            day: 'dddd'
        }
    });


    $("input[type='radio']").click(function () {
        var selection=$(this).val();
        var newselection = "#" + selection;
        $.mobile.changePage( newselection, {
            transition: "flip",
            reverse: true,
            changeHash: true
        });
        $('input[type="radio"]').filter('[value="'+selection+'"]').attr('checked', true); 
    });
});

function exportGoogleCal() {
    alert("Exporting to Google Calendar...");
}

function downloadAppleCal() {
    alert("Downloading for Apple Calendar...");
}

function shareFacebook() {
    alert("Sharing on Facebook...");
}

function shareTwitter() {
    alert("Sharing on Twitter...");
}