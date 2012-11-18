$(document).ready(function() {
    $(function() {
        $( "#accordion" ).accordion();
    });

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    
    $('#calview').fullCalendar({
        theme: true,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        events: [
            {
                title: 'All Day Event',
                start: new Date(y, m, 1)
            },
            {
                title: 'Long Event',
                start: new Date(y, m, d-5),
                end: new Date(y, m, d-2)
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d-3, 16, 0),
                allDay: false
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d+4, 16, 0),
                allDay: false
            },
            {
                title: 'Meeting',
                start: new Date(y, m, d, 10, 30),
                allDay: false
            },
            {
                title: 'Lunch',
                start: new Date(y, m, d, 12, 0),
                end: new Date(y, m, d, 14, 0),
                allDay: false
            },
            {
                title: 'Birthday Party',
                start: new Date(y, m, d+1, 19, 0),
                end: new Date(y, m, d+1, 22, 30),
                allDay: false
            },
            {
                title: 'Click for Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                url: 'http://google.com/'
            }
        ]
    });
});

function addCourse() {
    var inputStr = $("#addCourseBox").val();
    alert("Adding " + inputStr + "...");

    // Query database for 'inputStr'

    var accordion = $("#accordion");

    // Create <h3> for title
    var title = $("<h3>").text("15-237");

    // Create <table> for classes
    var table = $("<table>");

    // Extract data from Course object, append into tr's and td's

    // Append table into a div
    var content = $("<div>");
    content.append(table);

    // Append h3 then that div into 'accordion'
    accordion.append(title);
    accordion.append(content);
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