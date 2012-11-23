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
        editable: false,
        columnFormat: {
            month: 'dddd',
            week: 'dddd',
            day: 'dddd'
        }
    });

    $("#eventsLink").trigger('click');
});

/*** CourseBrowser ***/

$("#browseLink").fancybox({
    "scrolling" : "no",
    "titleShow" : false,
});

function searchForCourse() {
    var searchStr = $("#courseBrowserForm input").val();
    alert("Searching for " + searchStr + "...");
}

function addToSchedule(img) {
    var row = $(img).parent();
    var num = $(row).children("h1").html();
    alert("Adding " + num + " to schedule...");
}

/*** EventBrowser ***/

$("#eventsLink").fancybox({
    "scrolling" : "no",
    "titleShow" : false,
});

function processEventForm() {
    var courseNum = $("#eventFormCourseNum").val();
    var type = $("#eventFormType").val();
    var title = $("#eventFormTitle").val();
    var startTime = $("#eventFormStartTime").val();
    var endTime = $("#eventFormEndTime").val();
    var location = $("#eventFormLocation").val();
    var name = $("#eventFormName").val();
    var andrew = $("#eventFormAndrew").val();

    //alert("Course: " + courseNum + "\nType: " + type + "\nTitle: " + title + "\nStart time: " + startTime + "\nEnd time: " + endTime + "\nLocation: " + location + "\nName: " + name + "\nAndrew ID: " + andrew);

    var results = {
        "courseNum" : courseNum,
        "type" : type,
        "title" : title,
        "startTime" : startTime,
        "endTime": endTime,
        "location": location,
        "name": name,
        "andrew": andrew
    };

    if (validateEventForm(results) === true) {
        alert("valid!");

        /* Process the valid data here */

        /* When done, close the fancybox dialog */
    }
}

/* Perform form data validation */
function validateEventForm(res) {
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    var toChange = [];

    if (isNumber(parseInt(res.courseNum)) === false) {
        toChange.push("#eventFormCourseNum");
    }
    if (res.courseNum.length !== 5) {
        toChange.push("#eventFormCourseNum");
    }
    if (res.title.length === 0) {
        toChange.push("#eventFormTitle");
    }
    if (parseInt(res.endTime) <= parseInt(res.startTime)) {
        toChange.push("#eventFormEndTime");
    }
    if (res.location.length === 0) {
        toChange.push("#eventFormLocation");
    }
    if (res.name.length === 0) {
        toChange.push("#eventFormName");
    }
    if (res.andrew.length === 0) {
        toChange.push("#eventFormAndrew");
    }

    if (toChange.length === 0)
        return true;
    else {
        $.map(toChange, function(val, i) {
            $(val).css("border", "2px solid red");
        });

        return false;
    }
}


/*** Main screen ***/

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