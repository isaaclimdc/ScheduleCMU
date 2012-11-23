var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();

$(document).ready(function() {
    window.accordionOpts = {
        heightStyle: "content",
        collapsible: true,
        header: "> div > h3",
        animate: "easeOutCubic"
    };

    window.accordionSortOpts = {
        axis: "y",
        handle: "h3",
        stop: function( event, ui ) {
            // IE doesn't register the blur when sorting
            // so trigger focusout handlers to remove .ui-state-focus
            ui.item.children( "h3" ).triggerHandler( "focusout" );
        }
    };

    $(function() {
        $("#accordion").accordion(window.accordionOpts).sortable(window.accordionSortOpts);
    });

    // When the user presses enter to add course box
    $("#addCourseForm").submit(function(e){
        e.preventDefault();
        addCourse();
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
    var andrew = $("#eventFormAndrew").val();

    //alert("Course: " + courseNum + "\nType: " + type + "\nTitle: " + title + "\nStart time: " + startTime + "\nEnd time: " + endTime + "\nLocation: " + location + "\nAndrew ID: " + andrew);

    var results = {
        "courseNum" : courseNum,
        "type" : type,
        "title" : title,
        "startTime" : startTime,
        "endTime": endTime,
        "location": location,
        "andrew": andrew
    };

    if (validateEventForm(results) === true) {
        alert("valid!");

        /* Process the valid data here */

        /* When done, close the fancybox dialog */
        $.fancybox.close(false);
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

/*** ShareView ***/

$("#shareLink").fancybox({
    "scrolling" : "no",
    "titleShow" : false,
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

/*** Main screen ***/

function addCourse() {
    var inputStr = $("#addCourseBox").val();

    // Query database for 'inputStr'
    var course =
    { Num : "15122",
      Name : "Principles of Imperative Computation",
      Units : "10.0",
      Semester : 120,
      Sections : [ { Num : "Lec 1",
                     Mini : undefined,
                     Instructor : "Platzer",
                     Classes : [ { Day : "T",
                                   Start : "01:30PM",
                                   End : "02:50PM",
                                   Loc : "GHC 4102" },
                                 { Day : "R",
                                   Start : "01:30PM",
                                   End : "02:50PM",
                                   Loc : "GHC 4102" } ],
                     Subsections : [ { Num : "A",
                                       Mini : undefined,
                                       Instructor : "Bharadwaj",
                                       Classes : [ { Day : "W",
                                                     Start : "01:30PM",
                                                     End : "02:20PM",
                                                     Loc : "GHC 5304" },
                                                   { Day : "F",
                                                     Start : "01:30PM",
                                                     End : "02:20PM",
                                                     Loc : "GHC 5304" } ],
                                       Subsections : undefined },
                                     { Num : "B",
                                       Mini : undefined,
                                       Instructor : "Chopra",
                                       Classes : [ { Day : "W",
                                                     Start : "02:30PM",
                                                     End : "03:20PM",
                                                     Loc : "GHC 5305" },
                                                   { Day : "F",
                                                     Start : "02:30PM",
                                                     End : "03:20PM",
                                                     Loc : "GHC 5305" } ],
                                       Subsections : undefined } ] },
                   { Num : "Lec 2",
                     Mini : undefined,
                     Instructor : "Gunawardena",
                     Classes : [ { Day : "T",
                                   Start : "03:30PM",
                                   End : "04:50PM",
                                   Loc : "GHC 4102" },
                                 { Day : "R",
                                   Start : "03:30PM",
                                   End : "04:50PM",
                                   Loc : "GHC 4102" } ],
                     Subsections : [ { Num : "C",
                                       Mini : undefined,
                                       Instructor : "Horowitz",
                                       Classes : [ { Day : "W",
                                                     Start : "01:30PM",
                                                     End : "02:50PM",
                                                     Loc : "GHC 5306" },
                                                   { Day : "F",
                                                     Start : "01:30PM",
                                                     End : "02:50PM",
                                                     Loc : "GHC 5306" } ],
                                       Subsections : undefined },
                                     { Num : "D",
                                       Mini : undefined,
                                       Instructor : "Lim",
                                       Classes : [ { Day : "W",
                                                     Start : "02:30PM",
                                                     End : "03:50PM",
                                                     Loc : "GHC 5307" },
                                                   { Day : "F",
                                                     Start : "02:30PM",
                                                     End : "03:50PM",
                                                     Loc : "GHC 5307" } ],
                                       Subsections : undefined } ] } ] };
    var courseNum = course.Num;
    var courseName = course.Name;
    var courseUnits = course.Units;

    var accordion = $("#accordion");

    // Create <h3> for title
    var title = $("<h3>").text(courseNum);

    // Create contentHdr
    var contentHdr = $("<div>").addClass("contentHdr");
    contentHdr.append($("<p>").text(courseName));
    var del = $("<p>").addClass("del").attr("onClick", "deleteCourse();").text("delete");
    var info = $("<p>").addClass("info").attr("onClick", "infoCourse();").text("info");
    contentHdr.append(del);
    contentHdr.append(info);
    contentHdr.append("<hr>");

    // Create <table> for classes
    var table = $("<table>");

    // Extract data from Course object, append into tr's and td's

    // Append table into a div
    var content = $("<div>");
    content.append(contentHdr);
    content.append(table);

    // Append title h3 then content div into a group
    var group = $("<div>").addClass("group");
    group.append(title);
    group.append(content);

    // Append group into accordion and refresh. Expand the recently added
    window.accordionOpts.active = "h3:last";
    accordion.append(group).accordion('destroy').accordion(window.accordionOpts).sortable(window.accordionSortOpts);
    

    // var bgColor = title.css('background-color');

    // // Render Event on Calendar Widget
    // $('#calview').fullCalendar('renderEvent', {
    //     id: 999,
    //     title: courseNum,
    //     start: new Date(y, m, d, 16, 0),
    //     end: new Date(y, m, d, 18, 0),
    //     allDay: false,
    //     backgroundColor: bgColor
    // });
}

function deleteCourse() {
    alert("Deleting course");
}

function infoCourse() {
    alert("Getting course info");
}