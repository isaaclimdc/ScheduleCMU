$(document).ready(function() {
    /* Set up Accordion */
    window.accordionOpts = {
        heightStyle: "content",
        collapsible: true,
        header: "> div > h3",
        animate: "easeOutCubic"
    };
    $(function() {
        $("#accordion").accordion(window.accordionOpts);
    });

    /* Populate the page with the user's courses */
    fetchUserCourses();

    // When the user presses enter in forms
    $("#addCourseForm").submit(function(e){
        e.preventDefault();
        requestAndAddCourse();
    });
    $("#courseBrowserForm").submit(function(e){
        e.preventDefault();
        searchForCourseInCourseBrowser();
    });

    /* Set up FullCalendar */
    $("#calview").fullCalendar({
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
        },
        events: MyEvents
    });
});

function startSpinner() {
    /* Spin.js */
    var opts = {
      lines: 15, // The number of lines to draw
      length: 9, // The length of each line
      width: 2, // The line thickness
      radius: 26, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };

    var target = document.getElementsByTagName("body")[0];
    window.spinner = new Spinner(opts).spin(target);
}

function stopSpinner() {
    window.spinner.stop();
}

/* A convenient wrapper for $.ajax that automatically starts and stops
 * the spinner (spin.js), and does error checking. Requires an argument
 * opts: { url: string , success: fn, error (optional) : fn }
 */
function performAjaxRequest(opts) {
    startSpinner();

    $.ajax({
        url: opts.url,
        success: function(result, status) {
            /* Always log the request status */
            console.log(status);

            /* Perform user callback */
            opts.success(result, status);

            stopSpinner();
        },
        error: function(xhr, status, error) {
            if (opts.error !== undefined)
                opts.error(xhr, status, error);
            else
                console.log("Error: " + status + " with HTTP error: " + error);
            
            stopSpinner();
        },
        statusCode: {
            200: function() {  },
            404: function() { console.log("PAGE NOT FOUND!"); }
        }
    });
}

function fetchUserCourses() {
    performAjaxRequest({
        url: "http://isaacl.net/projects/schedulecmu/dummy.json",
        // url: "../../../scripts/out/dummy.json",
        success: function(result, status) {
            // window.listedCourses = JSON.parse(result);
            // console.log(window.listedCourses);

            console.log(result);
            window.listedCourses = result;

            for (var i = 0; i < window.listedCourses.length; i++) {
                addCourse(window.listedCourses[i]);
            }
        }
    });
}

function populateCalendar(start, end, callback) {
    var events = [];

    for (var i = 0; i < window.listedCourses.length; i++) {
        var course = window.listedCourses[i];


    }

    callback(events);
}

function addCourseToCalendar(course) {
    /* Extract data from Course object, append into tr's and td's */
    var sectionsArr = course.Sections;
    if (sectionsArr !== undefined) {
        for (var i = 0; i < sectionsArr.length; i++) {
            var section = sectionsArr[i];

            /* Take care of the main lecture/class first */
            addClassToCalendar(section);

            /* Now take care of the subsections (recitations) */
            var subsectionsArr = section.Subsections;
            if (subsectionsArr !== undefined) {
                for (j = 0; j < subsectionsArr.length; j++) {
                    var subsection = subsectionsArr[j];

                    processClasses(subsection, table, fullDetails);
                }
            }
        }
    }
}

function addClassToCalendar(section) {

}

function MyEvents(start, end, callback) {
    var events = [];

  var meeting = new Date(start.getFullYear(), 
   start.getMonth(), 
   start.getDate(),
   16, 30, 00);
  meeting.setDate((meeting.getDate() - meeting.getDay()) + 1);

  while (meeting <= end) {
    events.push({
      id: 2,
      title: "Monday Meeting",
      start: new Date(meeting.valueOf()),
      allDay: false
  });
    // increase by one week
    meeting.setDate(meeting.getDate() + 7);
}

callback(events);
}

/*** CourseBrowser ***/

$("#browseLink").fancybox({
    "scrolling" : "no",
    "titleShow" : false
});

function searchForCourseInCourseBrowser() {
    var searchStr = $("#courseBrowserForm input").val();

    /* Query our server */
    performAjaxRequest({
        url: "http://isaacl.net/projects/schedulecmu/dummy2.json",
        success: function(result, status) {
            // console.log(result);
            window.mostRecentSearchResults = result;

            for (var i = 0; i < result.length; i++) {
                addToCourseBrowser(result[i]);
            }
        }
    });
}

function addToCourseBrowser(course) {
    var row = $('<div>').addClass("courseBrowserRow");
    row.attr("onClick", "showInfoFromBrowser(this)");
    row.append($('<h1>').text(course.Num));
    row.append($('<h2>').text(course.Name));
    row.append($('<h3>').text(makeUnitsStr(course.Units)));
    row.append($('<img>').attr({
        "src" : "../images/plus.png",
        "onClick" : "addToSchedule(this)"
    }));

    $('#courseBrowserBody').append(row);
}

function addToSchedule(img) {
    var clickedIndex = $(img).parent().index();
    console.log(clickedIndex);
    console.log(window.mostRecentSearchResults);

    var course = window.mostRecentSearchResults[clickedIndex];
    window.listedCourses.push(course);

    addCourse(course);
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

function makeUnitsStr(units) {
    return units + " units";
}

function requestAndAddCourse() {
    var inputStr = $("#addCourseBox").val();

    /* Query database for 'inputStr' */

    /* Returns a Course object */
    /* Dummy data */
    var course = {
        Num: '54-300',
        Sections: [
            {
                Classes: [
                    {
                        End: '',
                        Loc: 'DNM DNM',
                        Day: 'TBA',
                        Start: ''
                    }
                ],
                Num: 'A',
                Instructor: 'Arons'
            },
            {
                Classes: [
                    {
                        End: '',
                        Loc: 'DNM DNM',
                        Day: 'TBA',
                        Start: ''
                    }
                ],
                Num: 'B',
                Instructor: 'Chemers'
            }
        ],
        Name: 'Dramaturgy Research Hours',
        Units: '1-12',
        Semester: 131
    };

    /* Add the new course to the global window.listedCourses */
    window.listedCourses.push(course);

    addCourse(course);
}

function addCourse(course) {
    var courseNum = course.Num;
    var courseName = course.Name;
    var courseUnits = course.Units;

    var accordion = $("#accordion");

    /* Create <h3> for title */
    var title = $("<h3>").text(courseNum);

    /* Create contentHdr */
    var contentHdr = $("<div>").addClass("contentHdr");
    contentHdr.append($("<p>").text(courseName));
    var units = $("<p>").addClass("units").text(makeUnitsStr(courseUnits));
    var del = $("<p>").addClass("del").attr("onClick", "deleteCourse(this);").text("delete");
    var info = $("<p>").addClass("info").attr("onClick", "showInfoFromAccordion(this);").text("info");
    contentHdr.append(units);
    contentHdr.append(del);
    contentHdr.append(info);
    contentHdr.append("<hr>");

    /* Create <table> for classes */
    var table = $("<table>");

    /* fullDetails is false because we don't want the extra
     * details in the small accordion.
     */
    insertCourseIntoTable(course, table, false);

    /* Append table into a div */
    var content = $("<div>");
    content.append(contentHdr);
    content.append(table);

    /* Append title h3 then content div into a group */
    var group = $("<div>").addClass("group");
    group.append(title);
    group.append(content);

    /* Append group into accordion and refresh. Expand the recently added */
    window.accordionOpts.active = "h3:last";
    accordion.append(group).accordion('destroy').accordion(window.accordionOpts);

    var bgColor = title.css('background-color');

    var startD = new Date(2012, 11, 26, 12, 30, 0, 0);
    var endD = new Date(2012, 11, 26, 13, 30, 0, 0);

    /* Render Event on Calendar Widget */
    $("#calview").fullCalendar("renderEvent", {
        id: 1,
        title: courseNum,
        start: startD,
        end: endD,
        allDay: false,
        backgroundColor: bgColor,
        stick: true
    });
}

/* Some helper functions for processing courses into table form */

/* Inserts a Course object into a provided jQuery HTML <table>
 * object. fullDetails is a boolean whether to append all details or not.
 */
function insertCourseIntoTable(course, table, fullDetails) {
    /* First append the header */
    var hdrRow = $("<tr>");
    hdrRow.append(newCol("Class"));
    hdrRow.append(newCol("Day"));
    hdrRow.append(newCol("Time"));

    if (fullDetails === true) {
        hdrRow.append(newCol("Instructor"));
        hdrRow.append(newCol("Location"));
    }

    table.append(hdrRow);

    /* Extract data from Course object, append into tr's and td's */
    var sectionsArr = course.Sections;
    if (sectionsArr !== undefined) {
        for (var i = 0; i < sectionsArr.length; i++) {
            var section = sectionsArr[i];

            /* Take care of the main lecture/class first */
            processClasses(section, table, fullDetails);

            /* Now take care of the subsections (recitations) */
            var subsectionsArr = section.Subsections;
            if (subsectionsArr !== undefined) {
                for (j = 0; j < subsectionsArr.length; j++) {
                    var subsection = subsectionsArr[j];

                    processClasses(subsection, table, fullDetails);
                }
            }
        }
    }
}

/* Process the classes of a "section" (both lecture and recitation).  
 * section is a Section object, and table is a jQuery object.
 * fullDetails is a boolean whether to append all details or not. 
 * This function appends to the DOM in-place.
 */
function processClasses(section, table, fullDetails) {
    var classesArr = section.Classes;

    if (areSameTime(classesArr) === true) {
        /* If all classes in this section start at the same time,
         * we only need 1 row.
         */
        var row = $("<tr>");

        /* Append the section number */
        row.append(newCol(section.Num));
        
        var daysStr = "";
        for (var i = 0; i < classesArr.length; i++) {
            /* Concat into a single string like "MWF" */
            daysStr += classesArr[i].Day;
        }

        /* Done concatenating, so append the day(s) */
        row.append(newCol(daysStr));

        /* Append the time. Since they start and end at the same
         * time, use index 0.
         */
        var theClass = classesArr[0];
        var startTime = theClass.Start;
        var endTime = theClass.End;
        row.append(newCol(makeTimeStr(startTime, endTime)));

        if (fullDetails === true) {
            row.append(newCol(section.Instructor));
            row.append(newCol(theClass.Loc));
        }

        /* Done. Append new row to the table */
        table.append(row);
    }
    else {
        /* Otherwise, need 1 row per day */
        for (var i = 0; i < classesArr.length; i++) {
            var row = $("<tr>");

            /* Append section num if first row, a space otherwise */
            if (i === 0) {
                row.append(newCol(section.Num));
            }
            else {
                row.append(newCol("&nbsp;"));
            }

            /* Append the day */
            row.append(newCol(classesArr[i].Day));

            /* Append the time */
            var theClass = classesArr[i];
            var startTime = theClass.Start;
            var endTime = theClass.End;
            row.append(newCol(makeTimeStr(startTime, endTime)));

            if (fullDetails === true) {
                row.append(newCol(section.Instructor));
                row.append(newCol(theClass.Loc));
            }

            /* Done with row. Append to table */
            table.append(row);
        }
    }
}

/* Checks whether all classes in a class array occur at the same
 * time on their designated days
 */
function areSameTime(classesArr) {
    for (var i = 0; i < classesArr.length - 1; i++) {
        var thisClass = classesArr[i];
        var nextClass = classesArr[i+1];
        if (thisClass.Start !== nextClass.Start ||
            thisClass.End !== nextClass.End) {
            return false;
        }
    }

    return true;
}

function newCol(str) {
    return $("<td>").html(str);
}

function makeTimeStr(start, end) {
    return start + " - " + end;
}

function deleteCourse(p) {
    /* Get to enclosing group (3 levels up) */
    var group = $(p).parent().parent().parent();
    var clickedIndex = $(group).index();

    // Remove the group then refresh accordion
    group.remove();
    $("#accordion").accordion('destroy').accordion(window.accordionOpts);

    // Send updated course list to server
    window.listedCourses.splice(clickedIndex, 1);
}

/*** Course Info Viewer ***/

$("#courseInfoLink").fancybox({
    "scrolling" : "no",
    "titleShow" : false,
});

function showInfoFromAccordion(infoLink) {
    /* Get to enclosing group (3 levels up) */
    var clickedIndex = $(infoLink).parent().parent().parent().index();

    /* Get this course from the global window.listedCourses */
    var course = window.listedCourses[clickedIndex];

    showInCourseInfoBrowser(course);
}

function showInfoFromBrowser(infoLink) {
    /* Get to enclosing group (3 levels up) */
    var clickedIndex = $(infoLink).index();

    /* Get this course from the global window.listedCourses */
    var course = window.mostRecentSearchResults[clickedIndex];

    showInCourseInfoBrowser(course);
}

function showInCourseInfoBrowser(course) {
    /* Create the modal view and populate with the desired course */
    var browser = $('#courseInfoBrowser');
    if (browser.length === 0) {
        browser = $("<div>").attr({
            "id": "courseInfoBrowser",
            "style": "display:none"
        });
    }
    else {
        browser.empty();
    }

    var header = $("<div>").attr("id", "courseInfoHeader");
    var headerNum = $("<h2>").text(course.Num);
    var headerName = $("<h3>").text(course.Name);
    var headerUnits = $("<h4>").text(makeUnitsStr(course.Units));

    header.append(headerNum);
    header.append(headerName);
    header.append(headerUnits);
    header.append($("<hr>"));

    browser.append(header);

    var body = $("<div>").attr("id", "courseInfoBody");
    var table = $("<table>");

    /* Here fullDetails = true because we want all details */
    insertCourseIntoTable(course, table, true);

    /* Append the completed table */
    body.append(table);

    /* Append other course details */
    body.append($("<h3>").text("Description"));
    body.append($("<p>").text("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante."));
    body.append($("<h3>").text("Prerequisites"));
    body.append($("<p>").text("15-151, 76-101, or 21-127"));
    body.append($("<h3>").text("Corequisites"));
    body.append($("<p>").text("None"));
    body.append($("<h3>").text("Cross-listed Courses"));
    body.append($("<p>").text("None"));

    /* Done, append the whole body */
    browser.append(body);

    /* Done. Append it anywhere in content */
    $("#content").append(browser);

    /* Open it */
    $("#courseInfoLink").click();
}