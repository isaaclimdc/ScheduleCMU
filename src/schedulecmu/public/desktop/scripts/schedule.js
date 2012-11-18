var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();

$(document).ready(function() {
    $(function() {
        $( "#accordion" ).accordion();
    });
    
    $('#calview').fullCalendar({
        theme: false,
        header: false,
        weekends: false,
        allDaySlot: false,
        minTime: 8,
        maxTime: 20,
        height: 800,
        defaultView: 'agendaWeek',
        editable: false
    });
});

function addCourse() {
    var inputStr = $("#addCourseBox").val();
    alert("Adding " + inputStr + "...");

    // Query database for 'inputStr'

    var accordion = $("#accordion");

    // Create <h3> for title
    var eventTitle = $("<h3>").text("15-237");

    // Create <table> for classes
    var table = $("<table>");

    // Extract data from Course object, append into tr's and td's

    // Append table into a div
    var content = $("<div>");
    content.append(table);

    // Append h3 then that div into 'accordion'
    accordion.append(eventTitle);
    accordion.append(content);

    var bgColor = eventTitle.css('background-color');

    // Render Event on Calendar Widget
    $('#calview').fullCalendar('renderEvent', {
        id: 999,
        title: eventTitle,
        start: new Date(y, m, d, 16, 0),
        end: new Date(y, m, d, 18, 0),
        allDay: false,
        backgroundColor: bgColor
    });
}

function browseCourses() {
    alert("Browse!");
    // Open modal sheet to browse courses
}

function openEventSheet() {
    alert("Events!");
    // Open modal sheet for course events
}

function openShareSheet() {
    alert("Share!");
    // Open modal sheet for sharing services
}