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

    // When the user presses enter in forms
    $("#addCourseForm").submit(function(e){
        e.preventDefault();
        requestAndAddCourse();
    });
    $("#courseBrowserForm").submit(function(e){
        e.preventDefault();
        searchForCourseInCourseBrowser();
    });
    $(".courseBrowserRow img").click(function(e) {
        //do something
        console.log("CAN'T GET THIS TO WORK!!");
        e.stopPropagation();
    });

    /* Only set up FullCalendar when all courses have been parsed. */
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
        lazyFetching: true,
        columnFormat: {
            month: 'ddd',
            week: 'ddd',
            day: 'ddd'
        },
        timeFormat: {
            /* Don't display time in title in agenda view */
            agenda: ''
        }
        // events: populateCalendar
    });

    /* Initialization */
    window.userSections = null;
    window.listedCourses = [];

    /* Populate the page with the user's courses */
    fetchUserSections();
    fetchUserCourses();
});

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

/**** Fetch Data ****/

function fetchUserCourses() {
    for (var i = 0; i < window.userSections.length; i++) {
        performAjaxRequest({
        url: "http://schedulecmu.aws.af.cm/api/courses?number=" + userCourse,
        success: function(result, status) {
            
            var course = (JSON.parse(result))[0];
            // console.log(course);

            var courseID = course._id;
            // console.log(courseID);

            performAjaxRequest({
                url: "http://schedulecmu.aws.af.cm/api/courses/" + courseID,
                success : function(result, status) {
                    // console.log(result);
                    window.listedCourses.push(result);
                    addCourse(result);

                    // var groupInAccordion = $('#accordion').children()[i];
                    // var color = $(groupInAccordion).children("h3").css("background-color");

                    addCourseToCalendar(result, "red");


                }
            });
        }
    });
}
}

function fetchUserSections() {
    window.userSections =
    [
        {"num" : "15-210", "section" : 1, "subsection" : 0},
        {"num" : "11-411", "section" : 0, "subsection" : 0},
        {"num" : "05-391", "section" : 0, "subsection" : 0},
        {"num" : "73-100", "section" : 1, "subsection" : 2},
        {"num" : "70-311", "section" : 0, "subsection" : 2}
    ];
}

/**** FullCalendar ****/

// /* This is the main function that is called to populate FullCalendar */
// function populateCalendar(start, end, callback) {
//     var events = [];

//     for (var i = 0; i < window.listedCourses.length; i++) {
//         var course = window.listedCourses[i];
//         var groupInAccordion = $('#accordion').children()[i];
//         var color = $(groupInAccordion).children("h3").css("background-color");

//         addCourseToCalendar(course, i, events, color);
//     }

//     console.log(events.length + " events added");
//     callback(events);
// }

/* Adds a single course to FullCalendar */
function addCourseToCalendar(course, color) {
    // var sem = parseInt(course.semester);
    var sem = parseInt("122"); /* Override for debugging */

    var sectionsToAdd = window.userSections[course.num];
    // console.log(sectionsToAdd);
    var sectIdxToAdd;
    var subsectIdxToAdd;

    if (sectionsToAdd === undefined) {
        sectIdxToAdd = 0;
        subsectIdxToAdd = 0;
    }
    else {
        sectIdxToAdd = sectionsToAdd.section;
        subsectIdxToAdd = sectionsToAdd.subsection;
    }

    if (subsectIdxToAdd < 0)
        subsectIdxToAdd = 0;

    var sectionsArr = course.sections;
    if (sectionsArr.length !== 0) {
        var section = sectionsArr[sectIdxToAdd];
        console.log(section);
        addClassesToCalendar(section, course.num, color, sem);
    }
    var subsectionsArr = section.subsections;
    console.log(section);
    if (subsectionsArr.length !== 0) {
        var subsection = subsectionsArr[subsectIdxToAdd];
        console.log(subsection);
        addClassesToCalendar(subsection, course.num, color, sem);
    }
}

/* Adds all classes of a course to FullCalendar */
function addClassesToCalendar(section, courseNum, color, sem) {
    var classesArr = section.classes;

    var year = 2000 + Math.floor(sem / 10);
    var encodedSem = sem % 10;
    var month;
    if (encodedSem === 0)
        month = 1   /* Spring starts January */
    else if (encodedSem === 1)
        month = 6   /* Summer starts June */
    else if (encodedSem === 2)
        month = 8   /* Fall starts August */

    /* The first day of the month that a semester begins */
    var semStartDate = new Date(year, month, 1, 10, 0);
    var semEndDate = new Date(year, month+5, 1, 10, 0); /* Give buffer of 1 month */

    for (var i = 0; i < classesArr.length; i++) {
        var aClass = classesArr[i];
        var date = getNearestDate(aClass.day, semStartDate);
        var sArr = processTimeStr(aClass.start);
        var eArr = processTimeStr(aClass.end);

        var startDate = new Date(year, date.getMonth(), date.getDate(), sArr[0], sArr[1]);
        var endDate = new Date(year, date.getMonth(), date.getDate(), eArr[0], eArr[1]);

        var courseNumName = courseNum + " (" + section.num + ")";

        /* Logic in order to have recurring events */
        while (startDate <= semEndDate) {
            var newEvent = {
                id: courseNumName,
                title: courseNumName + "\n" + aClass.loc,
                color: color,
                start: new Date(startDate.valueOf()),
                end: new Date(endDate.valueOf()),
                allDay: false
            };

            $('#calview').fullCalendar('renderEvent', newEvent);

            /* Push forward by one week */
            startDate.setDate(startDate.getDate() + 7);
            endDate.setDate(endDate.getDate() + 7);
        }
    }
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
        // url: "../testdata/dummy2.json",
        url: "http://isaacl.net/projects/schedulecmu/dummy.json",
        success: function(result, status) {
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
    row.append($('<h1>').text(course.num));
    row.append($('<h2>').text(course.name));
    row.append($('<h3>').text(makeUnitsStr(course.Units)));
    row.append($('<img>').attr({
        "src" : "../images/plus.png",
        "onClick" : "addToAccordion(this)"
    }));

    $('#courseBrowserBody').append(row);
}

function addToAccordion(img) {
    var clickedIndex = $(img).parent().index();
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

/**** ShareView ****/

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

/*** Accordion ***/

/* Called when the user presses "return" at the add course box. Queries
 * our database and parses the response into the accordion and calview
 */
function requestAndAddCourse() {
    var inputStr = $("#addCourseBox").val();
    $.trim(inputStr);

    /* Only if query is in the form "15-251" or "15251" */
    if (isNumberString(inputStr)) {
        var urlReq;
        var dept;
        var num;

        if (inputStr.charAt(2) === "-") {
            dept = inputStr.substring(0, 2);
            num = inputStr.substring(3);
        }
        else {
            dept = inputStr.substring(0, 2);
            num = inputStr.substring(2);
        }

        urlReq = "http://schedulecmu.aws.af.cm/api/courses?number=" + dept + "-" + num;
    }
    /* Else if it's "Great theoretical Ideas" */
    else {

    }
    
    // var urlReq = "../testdata/dummy2.json";

    /* Query database for 'inputStr' */
    performAjaxRequest({
        url : urlReq,
        success : function(result, status) {
            console.log(urlReq);
            console.log(result);
            // var course;

            // /* Returns a Course object */
            // for (var i = 0; i < result.length; i++) {
            //     if (result[i].num === inputStr) {
            //         course = result[i];

            //         /* Add the new course to the global window.listedCourses */
            //         window.listedCourses.push(course);

            //         addCourse(course);

            //         return;
            //     }
            // }

            console.log("Course not found");
        }
    });
}

function addCourse(course) {
    var courseNum = course.num;
    var courseName = course.name;
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

    /* Re-render Events on FullCalendar */
    $("#calview").fullCalendar("refetchEvents");
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
    var sectionsArr = course.sections;
    if (sectionsArr !== undefined) {
        for (var i = 0; i < sectionsArr.length; i++) {
            var section = sectionsArr[i];

            /* Take care of the main lecture/class first */
            processClasses(section, table, fullDetails, i);

            /* Now take care of the subsections (recitations) */
            var subsectionsArr = section.subsections;
            if (subsectionsArr !== undefined) {
                for (j = 0; j < subsectionsArr.length; j++) {
                    var subsection = subsectionsArr[j];

                    processClasses(subsection, table, fullDetails, i, j);
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
function processClasses(section, table, fullDetails, sectIdx, subsectIdx) {
    var classesArr = section.classes;

    if (areSameTime(classesArr) === true) {
        /* If all classes in this section start at the same time,
         * we only need 1 row.
         */
        var row = $("<tr>");

        /* Append the section number */
        row.append(newCol(section.num));
        
        var daysStr = "";
        for (var i = 0; i < classesArr.length; i++) {
            /* Concat into a single string like "MWF" */
            daysStr += classesArr[i].day;
        }

        /* Done concatenating, so append the day(s) */
        row.append(newCol(daysStr));

        /* Append the time. Since they start and end at the same
         * time, use index 0.
         */
        var theClass = classesArr[0];
        var startTime = theClass.start;
        var endTime = theClass.end;
        row.append(newCol(makeTimeStr(startTime, endTime)));

        if (fullDetails === true) {
            row.append(newCol(section.instructor));
            row.append(newCol(theClass.loc));
        }

        /* Add metadata for the section indexes */
        row.attr("onClick", "rowSelected(this);");
        row.attr("sect", sectIdx);

        if (subsectIdx === undefined)
            row.attr("id", "notSubsection");
        else
            row.attr("subsect", subsectIdx);

        /* Done. Append new row to the table */
        table.append(row);
    }
    else {
        /* Otherwise, need 1 row per day */
        for (var i = 0; i < classesArr.length; i++) {
            var row = $("<tr>");

            /* Append section num if first row, a space otherwise */
            if (i === 0) {
                row.append(newCol(section.num));
            }
            else {
                row.append(newCol("&nbsp;"));
            }

            /* Append the day */
            row.append(newCol(classesArr[i].day));

            /* Append the time */
            var theClass = classesArr[i];
            var startTime = theClass.start;
            var endTime = theClass.end;
            row.append(newCol(makeTimeStr(startTime, endTime)));

            if (fullDetails === true) {
                row.append(newCol(section.instructor));
                row.append(newCol(theClass.loc));
            }

            /* Add metadata for the section indexes */
            row.attr("onClick", "rowSelected(this);");
            row.attr("sect", sectIdx);

            if (subsectIdx !== undefined)
                row.attr("subsect", subsectIdx);

            /* Done with row. Append to table */
            table.append(row);
        }
    }
}

/* Called when a row in the accordion is selected */
function rowSelected(tr) {
    var row = $(tr)
    var clickedIndex = row.parent().parent().parent().parent().index();
    var sectIdx = parseInt(row.attr("sect"));
    var subsectIdx = parseInt(row.attr("subsect"));

    if (isNaN(subsectIdx))
        subsectIdx = -1;

    window.userSections[clickedIndex] = {
        "Section" : sectIdx,
        "Subsection" : subsectIdx
    };

    /* Re-render Events on FullCalendar */
    $("#calview").fullCalendar("refetchEvents");
}

/* Called when "delete" is clicked */
function deleteCourse(p) {
    /* Get to enclosing group (3 levels up) */
    var group = $(p).parent().parent().parent();
    var clickedIndex = $(group).index();

    // Remove the group then refresh accordion
    group.remove();
    $("#accordion").accordion('destroy').accordion(window.accordionOpts);

    // Send updated course list to server
    window.listedCourses.splice(clickedIndex, 1);
    window.userSections.splice(clickedIndex, 1);

    /* Re-render Events on FullCalendar */
    $("#calview").fullCalendar("refetchEvents");
}

/**** CourseInfo ****/

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

    $("#courseInfoLink").fancybox({
        "afterClose": function() {
            $("#browseLink").click();
        }
    });

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
    var headerNum = $("<h2>").text(course.num);
    var headerName = $("<h3>").text(course.name);
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
    body.append($("<p>").text("15-151, 76-101, or 21-127 (Dummy data)"));
    body.append($("<h3>").text("Corequisites"));
    body.append($("<p>").text("None (Dummy data)"));
    body.append($("<h3>").text("Cross-listed Courses"));
    body.append($("<p>").text("None (Dummy data)"));

    /* Done, append the whole body */
    browser.append(body);

    /* Done. Append it anywhere in content */
    $("#content").append(browser);

    /* Open it */
    $("#courseInfoLink").click();
}














/**** Helper functions ****/

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

/* Returns the nearest date relative to the start of the semester */
function getNearestDate(dayStr, semDate) {
    var firstDayOfSem = semDate.getDay();

    /* WE SHOULD DO THIS SERVER-SIDE */
    var classDay;
    if (dayStr === "U")
        classDay = 0;
    else if (dayStr === "M")
        classDay = 1;
    else if (dayStr === "T")
        classDay = 2;
    else if (dayStr === "W")
        classDay = 3;
    else if (dayStr === "R")
        classDay = 4;
    else if (dayStr === "F")
        classDay = 5;
    else if (dayStr === "S")
        classDay = 6;

    var diff = classDay - firstDayOfSem;  /* Could be <0 */
    var newDate = 1 + diff;  /* Offset from 1st of month */

    /* In case overflows to previous month */
    if (newDate < 0)
        newDate += 7;

    return new Date(semDate.getFullYear(), semDate.getMonth(), newDate, 10, 0);
}

/* Splits a time string like "12:50p" into an array [12,50],
 * and converts to military time
 */
function processTimeStr(timeStr) {
    var arr = timeStr.split(":");
    var isPM = (timeStr.charAt(timeStr.length-1) === "p") ? true : false;

    var hours = parseInt(arr[0]);
    var minutes = parseInt(arr[1]);

    /* mod 24 to take care of midnight, lol */
    arr[0] = (isPM === true && hours !== 12) ? (hours + 12) % 24 : hours;
    arr[1] = minutes;

    return arr;
}

function makeUnitsStr(units) {
    return units + " units";
}

function newCol(str) {
    return $("<td>").html(str);
}

function makeTimeStr(start, end) {
    return start + " - " + end;
}

/* Checks whether all classes in a class array occur at the same
 * time on their designated days
 */
function areSameTime(classesArr) {
    for (var i = 0; i < classesArr.length - 1; i++) {
        var thisClass = classesArr[i];
        var nextClass = classesArr[i+1];
        if (thisClass.start !== nextClass.start ||
            thisClass.end !== nextClass.end) {
            return false;
        }
    }

    return true;
}

/* Just as it sounds */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isNumberString(str) {
    return JSON.stringify(parseInt(str)) == str;
}