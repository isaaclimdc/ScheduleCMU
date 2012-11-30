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
            month: 'ddd',
            week: 'ddd',
            day: 'ddd'
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
    });
});

$('body').bind('hideOpenMenus', function(){
    $("ul:jqmData(role='menu')").find('li > ul').hide();
}); 
var menuHandler = function(e) {
    $('body').trigger('hideOpenMenus');
    $(this).find('li > ul').show();
    e.stopPropagation();
};
$("ul:jqmData(role='menu') li > ul li").click(function(e) {
   $('body').trigger('hideOpenMenus');
e.stopPropagation();
});
$('body').delegate("ul:jqmData(role='menu')",'click',menuHandler);
$('body').click(function(e){
   $('body').trigger('hideOpenMenus');
});