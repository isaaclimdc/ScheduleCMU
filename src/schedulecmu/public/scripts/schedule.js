/* Set up globals */

/* Sets this global flag to whether the current browser is a
 * mobile browser or not, so that we can case on it if necessary.
 */
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

/* Base URL for the API */
// window.baseURL = "http://schedulecmu.aws.af.cm/api";
window.baseURL = "http://www.schedulecmu.org/api";

/* Initialization of arrays */
window.userBlocks = [];
window.listedCourses = [];
window.events = [];


/* A convenient wrapper for $.ajax that automatically starts and stops
 * the spinner (spin.js), and does error checking. Requires an argument
 * opts: { url: string , success: fn, error (optional) : fn }
 */
function performAjaxRequest(opts) {
    if (window.isMobile === false)
        startSpinner();

    var type = (opts.type !== undefined) ? opts.type : "GET";

    var url = (opts.customurl !== undefined) ? opts.customurl : (window.baseURL + opts.url);

    var statusCode;
    if (opts.statusCode !== undefined)
        statusCode = opts.statusCode;
    else
        statusCode = {
            200: function() {  },
            404: function() { console.log("PAGE NOT FOUND!"); }
        }

    $.ajax({
        type : type,
        url : url,
        data : opts.data,
        statusCode : statusCode,
        success : function(result, status) {
            /* Always log the request status */
            // console.log(status);

            /* Parse it if it's not a custom request */
            if (opts.customurl === undefined) {
                if (typeof(result) !== "object")
                    result = $.parseJSON(result);
            }

            /* Perform user callback */
            opts.success(result, status);

            if (window.isMobile === false)
                 stopSpinner();
        },
        error : function(xhr, status, error) {
            if (opts.error !== undefined)
                opts.error(status, error);
            else
                console.log("Error: " + status + " with HTTP error: " + error);

            if (window.isMobile === false)
                 stopSpinner();
        }
    });
}

/**** Fetch Data ****/

function fetchUserSchedule(user) {
    /* Set up the DOM first */
    setupPage();

    var schedulesArr = user.schedules;

    /* Guaranteed to have at least 1 schedule, created in login.js.
     * Eventually we want to let the user select which schedule to
     * edit here.
     */
    var latestSchedule = schedulesArr[0];

    $('#semTitle').text(convertSemToReadable(latestSchedule.semester));
    $('#scheduleVersion').text(latestSchedule.name);

    /* Save the current user info globally for use throughout */
    window.userID = user._id;
    window.schedID = latestSchedule._id;
    window.userBlocks = latestSchedule.course_blocks;

    fetchCourseData();
    // fetchEventsToVote();
}

function setupPage() {
    var height;
    var contentHeight;
    var columnFormat;
    var clickCB;

    /* Setup for DESKTOP client */
    if (window.isMobile === false) {
        $("#eventFormDate").datePicker();

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

        /* Options for DESKTOP FullCalendar */
        height = 800;
        columnFormat = {
            month: 'dddd',
            week: 'dddd',
            day: 'dddd'
        };
        /* For debugging - shows dates too */
        // columnFormat = {
        //     month: 'dddd M/d',
        //     week: 'dddd M/d',
        //     day: 'dddd M/d'
        // };
        clickCB = function(calEvent, jsEvent, view) {
            var idx = fetchListedCourseWithID(calEvent.id).idx;
            $("#accordion").accordion("option", "active", idx);
        }
    }

    /* Setup for MOBILE client */
    else {
        /* Options for MOBILE FullCalendar */
        contentHeight = $(document).height() - $('#gridviewheader').height();
        height = contentHeight;
        columnFormat = {
            month: 'ddd',
            week: 'ddd',
            day: 'ddd'
        };

        $('#gridview').live('pageshow', function(e) {
            console.log('Grid View shown!');
            /* Refresh FullCalendar */
            $('#calview').fullCalendar('refetchEvents');
        });

        /* Refresh jQuery mobile */
        $('#listview').live('pagebeforeshow', function(e) {
            refreshJQMElements();
        });

        if ($(document).width() <= 750) {
            $('#loginGrid').children('.ui-block-a').css('display','none');
            $('#loginGrid').children('.ui-block-b').removeClass('ui-block-b');
            $('#loginGrid').removeClass('ui-grid-b');
        }
    }

    /* Only set up FullCalendar when all courses have been parsed. */
    $('#calview').fullCalendar({
        theme: false,
        header: false,
        weekends: false,
        allDaySlot: false,
        minTime: 8,
        height: height,
        contentHeight: contentHeight,
        defaultView: 'agendaWeek',
        editable: false,
        lazyFetching: true,
        columnFormat: columnFormat,
        timeFormat: {
            /* Don't display time in title in agenda view */
            agenda: ''
        },
        ignoreTimezone: false,
        events: window.events,
        eventClick: clickCB
    });

    /* Override submission of forms */
    $("#addCourseForm").submit(function(e){
        e.preventDefault();
        requestAndAddCourse();
    });
    $("#courseBrowserForm").submit(function(e){
        e.preventDefault();
        searchForCourseInCourseBrowser();
    });
    $("#eventForm").submit(function(e){
        e.preventDefault();
        processEventForm();
    });
}

function fetchCourseData() {
    for (var i = 0; i < window.userBlocks.length; i++) {
        performAjaxRequest({
            url: "/courses/" + window.userBlocks[i]._id,
            success: function(result, status) {
                var course = result;
                // console.log(course);

                if (course === null) {
                    return;
                }

                window.listedCourses.push(course);
                addCourse(course);
            }
        });
    }
}

/**** FullCalendar ****/

/* Wrapper to do all that we need! */
function addCourse(course) {
    addCourseToAccordion(course);
    addCourseToCalendar(course);
}

/* Adds a single course to FullCalendar */
function addCourseToCalendar(course) {
    // var sem = parseInt(course.semester);
    var sem = parseInt("122"); /* Override for debugging */

    var sectionsToAdd;
    for (var i = 0; i < window.userBlocks.length; i++) {
        if (window.userBlocks[i]._id === course._id) {
            sectionsToAdd = window.userBlocks[i];
        }
    }

    var color;
    for (var i = 0; i < window.listedCourses.length; i++) {
        if (window.listedCourses[i]._id === course._id) {
            color = getColorFromIndex(i);
        }
    }

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

    /* Add "lectures" */
    var sectionsArr = course.sections;
    if (sectionsArr.length !== 0) {
        var section = sectionsArr[sectIdxToAdd];
        addClassesToCalendar(section, course, color, sem);
    }

    /* Add "recitations" */
    var subsectionsArr = section.subsections;
    if (subsectionsArr.length !== 0) {
        var subsection = subsectionsArr[subsectIdxToAdd];
        addClassesToCalendar(subsection, course, color, sem);
    }

    /* Add "events" */
    addEventsToCalendar(course, color);

    /* Done adding course. Resize FullCalendar if needed */
    // var latest = getLatestEvent();

    /* Refresh FullCalendar */
    $('#calview').fullCalendar('refetchEvents');
}

/* Adds all classes of a course to FullCalendar */
function addClassesToCalendar(section, course, color, sem) {
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

        var courseNumName = course.num + " (" + section.num + ")";

        /* Logic in order to have recurring events */
        while (startDate <= semEndDate) {
            window.events.push({
                id: course._id,
                title: courseNumName + "\n" + aClass.loc,
                color: color,
                start: new Date(startDate.valueOf()),
                end: new Date(endDate.valueOf()),
                allDay: false,
            });

            /* Push forward by one week */
            startDate.setDate(startDate.getDate() + 7);
            endDate.setDate(endDate.getDate() + 7);
        }
    }
}

/* Add course events related to this course to FullCalendar */
function addEventsToCalendar(course, color) {
    var courseEvents = course.course_events;

    for (var i = 0; i < courseEvents.length; i++) {
        var anEvent = courseEvents[i];

        window.events.push({
            id: course._id,
            title: course.num + " " + anEvent.title + "\n" + anEvent.loc,
            color: color,
            start: anEvent.start,
            end: anEvent.end,
            allDay: false,
        });
    }
}

/*** Accordion ***/

/* Called when the user presses "return" at the add course box. Queries
 * our database and parses the response into the accordion and calview
 */
function requestAndAddCourse() {
    /* Remove all whitespace from query string */
    var inputStr = $("#addCourseBox").val();
    inputStr = inputStr.replace(/\s/g,'');
    if (inputStr.length === 0)
        return;

    /* Can be "15251" or "15-251". Parsed server-side */
    var urlReq = "/courses?number=" + inputStr;

    /* Query database for 'inputStr' */
    performAjaxRequest({
        url : urlReq,
        success : function(result, status) {
            var addCourseBox = $('#addCourseBox').val("");

            setPlaceholder(addCourseBox, "Searching...");

            if (result.length === 0) {
                setPlaceholder(addCourseBox, "Course not found!");
                return;
            }

            /* ID of the course we want to add */
            var course = result[0];
            var courseID = course._id;
            console.log(course, courseID);

            /* Check if this course is already in the existing courses */
            for (var i = 0; i < window.userBlocks.length; i++) {
                if (window.userBlocks[i]._id === courseID) {
                    setPlaceholder(addCourseBox, "Course already added");
                    return;
                }
            }

            /* GET full Course object */
            fetchCourseWithID(courseID, function() {
                setPlaceholder(addCourseBox, course.num + " added!");
            });
        }
    });
}

/* GETs the full Course object with the supplied id */
function fetchCourseWithID(courseID, onSuccess) {
    performAjaxRequest({
        url : "/courses/" + courseID,
        success : function(result, status) {
            var course = result;
            var courseID = course._id;
            console.log(course);

            var newBlock = {
                "_id" : courseID,
                "section" : 0,
                "subsection" : 0
            };

            window.listedCourses.push(course);
            window.userBlocks.push(newBlock);
            addCourse(course);
            if (window.isMobile === true)
                refreshJQMElements();

            /* Finally, POST to User account */
            performAjaxRequest({
                type : "POST",
                url : "/users/" + window.userID + "/schedules/" + window.schedID + "/blocks/" + courseID,
                data : {
                    data : newBlock,
                    "auth_token" : window.accessToken,
                    "_method" : "PUT"
                },
                success : function(result2, status) {
                    console.log("Successfully added block!", result2);

                    onSuccess();

                    if (window.isMobile === true) {
                        $('#addCourseBox').blur();
                    }
                }
            });
        }
    });
}

function addCourseToAccordion(course) {
    var courseNum = course.num;
    var courseName = course.name;
    var courseUnits = course.units;

    var accordion = $("#accordion");

    var idx = window.listedCourses.indexOf(course);
    var color = getColorFromIndex(idx);

    /* Create <h3> for title */
    var title = $("<h3>").text(courseNum);

    /* Create contentHdr */
    var contentHdr = $("<div>").addClass("contentHdr");
    var name = $("<p>").text(courseName).css("font-weight", "bold");
    contentHdr.append(name);
    var units = $("<p>").addClass("units").text(makeUnitsStr(courseUnits));

    if (window.isMobile === false) {
        title.css("background-color", color);
        contentHdr.css("background-color", color);
    }

    var del;
    var info;

    if (window.isMobile === false) {
        del = $("<p>").addClass("del").text("delete");
        del.attr({
            "onClick" : "deleteCourse(this);",
            "id" : course._id
        });
        info = $("<p>").addClass("info").text("info");
        info.attr({
            "onClick" : "showInfo(this, true);",
            "id" : course._id
        });
    }
    else {
        del = $("<div>").attr({
            "onClick" : "deleteCourse(this);",
            "id" : course._id,
            "data-role" : "button",
            "data-mini" : "true",
            "data-icon" : "myapp-del",
            "data-inline" : "true",
            "data-iconpos" : "notext"
        }).text("delete").addClass("del");

        info = $("<div>").attr({
            "onClick" : "showInfo(this, true);",
            "id" : course._id,
            "data-role" : "button",
            "data-mini" : "true",
            "data-icon" : "myapp-info",
            "data-inline" : "true",
            "data-iconpos" : "notext"
        }).text("info").addClass("info");
    }
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

    if (window.isMobile === false) {
        /* Append title h3 then content div into a group */
        var group = $("<div>").addClass("group");
        group.attr("id", course._id);
        group.append(title);
        group.append(content);

        /* Append group into accordion and refresh. Expand the recently added */
        window.accordionOpts.active = "h3:last";
        accordion.append(group).accordion('destroy').accordion(window.accordionOpts);
    }
    else {
        var group = $("<div>");
        group.attr({
            "id" : course._id,
            "data-role" : "collapsible",
            "data-content-theme" : "a"
        });
        group.addClass("group");
        group.append(title);
        group.append(content);
        accordion.append(group);
    }

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

        if (subsectIdx !== undefined)
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
function rowSelected(selected) {
    var row = $(selected);

    if (window.isMobile === true) {
        $.each(row.parents('table').find('tr'), function(idx, elt) {
            $(elt).css({
                'background-color' : '',
                'font-weight' : ''
            });
        });

        row.css({
            'background-color' : '#ededed',
            'font-weight' : 'bold'
        });
    }

    var sectIdx = parseInt(row.attr("sect"));
    var subsectIdx = parseInt(row.attr("subsect"));

    if (isNaN(subsectIdx))
        subsectIdx = -1;

    /* Extract course from course ID */
    var group = row.parents(".group")[0];
    var courseID = $(group).attr("id");
    var course = fetchListedCourseWithID(courseID).course;

    /* Update the local copy of the block */
    var newBlock;
    for (var i = 0; i < window.userBlocks.length; i++) {
        if (window.userBlocks[i]._id === courseID) {
            window.userBlocks[i].section = sectIdx;
            window.userBlocks[i].subsection = subsectIdx;
            newBlock = window.userBlocks[i];
            break;
        }
    }

    /* PUT this updated block to server */
    performAjaxRequest({
        type : "POST",
        url : "/users/" + window.userID + "/schedules/" + window.schedID + "/blocks/" + courseID,
        data : {
            data : newBlock,
            "auth_token" : window.accessToken,
            "_method" : "PUT"
        },
        success : function(result, status) {
            refreshCalendar(course);
        }
    });
}

/* Deletes a single course */
function deleteCourse(clickedLink) {
    /* Extract course id from the "id" field */
    var courseID = $(clickedLink).attr("id");

    /* Get this course from the global window.listedCourses */
    // var course = fetchListedCourseWithID(courseID).course;

    var toDelete = $('#accordion').children("#" + courseID)[0];
    $(toDelete).remove();

    if (window.isMobile === false) {
        $("#accordion").accordion('destroy').accordion(window.accordionOpts);
    }

    /* Update local lists */
    window.listedCourses = $.grep(window.listedCourses, function(elt, idx) {
        if (elt._id === courseID) {
            return false;
        }
        return true;
    });

    window.userBlocks = $.grep(window.userBlocks, function(elt, idx) {
        if (elt._id === courseID) {
            return false;
        }
        return true;
    });

    /* Refresh FullCalendar */
    $("#calview").fullCalendar("clientEvents",
        function(eventToRemove) {
            if (eventToRemove.id === courseID) {
                window.events.removeObj(eventToRemove);
            }
        });

    $('#calview').fullCalendar('refetchEvents');

    /* Refresh jQuery Mobile */
    if (window.isMobile === true)
        refreshJQMElements();

    /* DELETE the course from the server */
    performAjaxRequest({
        type : "POST",
        url : "/users/" + window.userID + "/schedules/" + window.schedID + "/blocks/" + courseID,
        data : {
            _method : "DELETE",
            auth_token : window.accessToken
        },
        success : function(result, status) {
            console.log(result);
        }
    });
}

/*** CourseBrowser ***/
if (window.isMobile === false) {
    $("#browseLink").fancybox({
        "scrolling" : "no",
        "titleShow" : false
    });
}

function searchForCourseInCourseBrowser() {
    var inputStr = $("#courseBrowserForm input").val();

    /* Can be "15251" or "15-251". Parsed server-side */
    var urlReq;
    if (inputStr.length <= 2)
        urlReq = "/courses?dept=" + inputStr;    /* Search by dept number*/
    else{
        if(inputStr.slice(0,1).match(/^[0-9]/))
            urlReq = "/courses?number=" + inputStr;  /* Search by course num */
        else{
            urlReq="/courses?dept="+(inputStr.replace(" ","+")
                                     .replace("&","+")
                                     .replace(":","+")); /* Search by dept name*/
        }
    }
    /* Query our server */
    performAjaxRequest({
        url: urlReq,
        success: function(result, status) {
            var box = $("#courseBrowserSearchBox").val("");

            if (result.length === 0) {
                setPlaceholder(box, "No courses found!");
                return;
            }

            setPlaceholder(box, 'Courses found containing "' + inputStr + '"');

            $('#courseBrowserBody').empty();

            window.mostRecentSearchResults = result;

            for (var i = 0; i < result.length; i++) {
                addToCourseBrowser(result[i]);
            }
        }
    });
}

function addToCourseBrowser(course) {
    var row;
    if (window.isMobile === false) {
        row = $('<div>').addClass("courseBrowserRow");
        row.attr({
            "onClick" : "showInfo(this, false);",
            "id" : course._id
        });
        row.append($('<h1>').text(course.num));
        row.append($('<h2>').text(course.name));
        row.append($('<h3>').text(makeUnitsStr(course.units)));
        row.append($('<img>').attr({
            "src" : "../images/mobilePlus.png",
            "onClick" : "addCourseFromBrowser(this)"
        }));

        $('#courseBrowserBody').append(row);
    }
    else {
        row = $('<li>');
        var rowInside = $('<a>');
        rowInside.attr({
            "onClick" : "showInfo(this, false);",
            "id" : course._id
        });
        rowInside.append($('<h1>').text(course.num));
        rowInside.append($('<h2>').text(course.name));
        rowInside.append($('<h3>').text(makeUnitsStr(course.units)));
        var rowTwo = $('<a>');
        rowTwo.attr("href", "#listview");
        rowTwo.attr("onclick", 'addCourseFromBrowser(this)');
        rowTwo.append('Add Course');
        row.append(rowInside);
        row.append(rowTwo);

        $('#courseBrowserBody').append(row);
        $('#courseBrowserBody').listview('refresh');
    }

    /* Done, close keyboard */
    if (window.isMobile === true) {
        $('#courseBrowserSearchBox').blur();
    }
}

function addCourseFromBrowser(img) {
    var clickedIndex = $(img).parent().index();
    var course = window.mostRecentSearchResults[clickedIndex];
    var courseID = course._id;

    var courseBrowserBox = $('#courseBrowserForm input').val("");

    /* Check if this course is already in the existing courses */
    for (var i = 0; i < window.userBlocks.length; i++) {
        if (window.userBlocks[i]._id === courseID) {
            setPlaceholder(courseBrowserBox, "Course already added!");
            return;
        }
    }

    /* Otherwise, get full course object */
    fetchCourseWithID(courseID, function() {
        setPlaceholder(courseBrowserBox, course.num + " added!");
    });

    if (window.isMobile === false) {
        $.fancybox.close(false);
    }
}


/**** CourseInfo ****/

if (window.isMobile === false ) {
    $("#courseInfoLink").fancybox({
        "scrolling" : "no",
        "titleShow" : false,
    });
}

function showInfo(clickedLink, isExisting) {
    /* Extract course id from the "id" field */
    var courseID = $(clickedLink).attr("id");
    console.log(courseID);

    if (isExisting === true) {
        /* Get this course from the global list then display it */
        var course = fetchListedCourseWithID(courseID).course;
        showInfoInCourseBrowser(course);
    }
    else {
        /* Transition between fancyboxes */
        if (window.isMobile === false) {
            $("#courseInfoLink").fancybox({
                "afterClose": function() {
                    $("#browseLink").click();
                }
            });
        }

        /* GET the full course object for display */
        performAjaxRequest({
            url : "/courses/" + courseID,
            success : function(result, status) {
                showInfoInCourseBrowser(result);
            }
        });
    }
}

function showInfoInCourseBrowser(course) {
    console.log(course);
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
    var headerUnits = $("<h4>").text(makeUnitsStr(course.units));

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
    // body.append($("<h3>").text("Description"));
    // body.append($("<p>").text(course.details.description));
    // body.append($("<h3>").text("Prerequisites"));
    // body.append($("<p>").text(course.details.prereqs));
    // body.append($("<h3>").text("Corequisites"));
    // body.append($("<p>").text(course.details.coreqs));

    /* Done, append the whole body */
    browser.append(body);

    if (window.isMobile === true) {
        /* Open it */
        $("#courseInfoLink").click();
    }
    else {
        /* Done. Append it anywhere in content */
        $("#content").append(browser);

        /* Open it */
        $("#courseInfoLink").click();
    }
}


/*** EventBrowser ***/

if (window.isMobile === false ) {
    $("#eventsLink").fancybox({
        "scrolling" : "no",
        "titleShow" : false,
    });
}

/* Populate the courseNum box with the user's listed courses */
function showEventForm() {
    console.log("Showing event form..");
    var courseNumSelect = $('#eventFormCourseNum');
    courseNumSelect.empty();

    for (var i = 0; i < window.listedCourses.length; i++) {
        var courseNum = window.listedCourses[i].num;
        var newOption = $('<option>').attr("value", courseNum);
        newOption.text(courseNum);
        courseNumSelect.append(newOption);
    }

    /* Open it */
    $('#eventsLink').click();
}

function processEventForm() {
    var courseNum = $("#eventFormCourseNum").val();
    var type = parseInt($("#eventFormType").val());
    var title = $("#eventFormTitle").val();
    var location = $("#eventFormLocation").val();
    var dateStr = $("#eventFormDate").val();
    var startTime = $("#eventFormStartTime").val();
    var endTime = $("#eventFormEndTime").val();

    var results = {
        "courseNum" : courseNum,
        "type" : type,
        "title" : title,
        "location": location,
        "date" : dateStr,
        "startTime" : startTime,
        "endTime": endTime
    };

    /* Process the valid data here */
    if (validateEventForm(results) === true) {
        /* Parse time and date */
        var startArr = processTimeStr(startTime);
        var endArr = processTimeStr(endTime);
        var startDate;
        var endDate;

        if (window.isMobile === true) {
            /* If mobile, in the form "2012-12-06" */
            var d = new Date(dateStr);
            d.setHours(d.getHours()+12);  /* So we're not at the midnight border */

            startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startArr[0], startArr[1]);
            endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endArr[0], endArr[1]);
        }
        else {
            var dateArr = dateStr.split("/");

            /* Who knew "January" == 0?? */
            startDate = new Date(dateArr[2], dateArr[0]-1, dateArr[1], startArr[0], startArr[1]);
            endDate = new Date(dateArr[2], dateArr[0]-1, dateArr[1], endArr[0], endArr[1]);
        }

        /* Get the course ID */
        performAjaxRequest({
            url : "/courses?number=" + courseNum,
            success : function(res, sta) {
                if (res.length === 0) {
                    /* Course not found */
                    var box = $("#eventFormCourseNum").css("border", "2px solid red").val("");
                    setPlaceholder(box, "Course not found!");

                    if (window.isMobile === true)
                        $.mobile.silentScroll(0);
                    return;
                }

                var courseID = res[0]._id;

                /* POST the new event to this course ID */
                performAjaxRequest({
                    type : "POST",
                    url : "/courses/" + courseID + "/events",
                    data : {
                        data : {
                            "event_type" : type,
                            "title" : title,
                            "loc" : location,
                            "start" : startDate,
                            "end" : endDate
                        },
                        "auth_token" : window.accessToken,
                        "_method" : "POST"
                    },
                    success : function(result, status) {
                        var updatedCourse = result;
                        console.log(updatedCourse);

                        /* Refresh FullCalendar */
                        refreshCalendar(updatedCourse);

                        /* When done, close the dialog */
                        clearForm("#eventForm");
                        if (window.isMobile === false) {
                            $.fancybox.close(false);
                        }
                        else {
                            $('.ui-dialog').dialog('close');
                        }
                    }
                });
            }
        });
    }
}

/* Perform form data validation */
function validateEventForm(res) {
    var toChange = [];

    if (res.courseNum.length !== 6) {
        toChange.push("#eventFormCourseNum");
    }
    if (res.title.length === 0) {
        toChange.push("#eventFormTitle");
    }
    if (res.location.length === 0) {
        toChange.push("#eventFormLocation");
    }
    if (res.date.length === 0) {
        toChange.push("#eventFormDate");
    }
    else if (window.isMobile === false) {
        var regx = /[0-9]{2}\/[0-9]{1,2}\/[0-9]{4}/;
        if (regx.test(res.date) === false) {
            toChange.push("#eventFormDate");
        }
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

    if (window.spinner !== undefined)
        window.spinner.spin(target);
    else
        window.spinner = new Spinner(opts).spin(target);
}

function stopSpinner() {
    if (window.spinner !== undefined)
    window.spinner.stop();
    window.spinner = undefined;
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

Array.prototype.removeObj = function(obj) {
    this.splice(this.indexOf(obj), 1);
}

function convertSemToReadable(sem) {
    var year = 2000 + sem / 10;
    var semNum = sem % 10;
    var season;
    if (semNum === 0)
        season = "Spring";
    else if (semNum === 1)
        season = "Summer";
    else if (semNum === 2)
        season = "Fall";

    return season + " " + year;
}

/* Helper to set the placeholder of box, which is a jQuery object */
function setPlaceholder(box, str) {
    return $(box).attr("placeholder", str);
}

/* The predefined colors for the accordion and calendar */
function getColorFromIndex(idx) {
    var color;

    if (idx == 0) color = "#D96C6E";
    else if (idx == 1) color = "#BEFF7A";
    else if (idx == 2) color = "#9ECFFF";
    else if (idx == 3) color = "#FFF257";
    else if (idx == 4) color = "#C891FF";
    else if (idx == 5) color = "#FFBE69";
    else if (idx == 6) color = "#FF9EC5";
    else if (idx == 7) color = "#CFCFCF";
    else if (idx == 8) color = "#69FF6B";
    else if (idx == 9) color = "#8FFFFD";
    else color = "#D96C6E";

    return color;
}

function fetchListedCourseWithID(courseID) {
    for (var i = 0; i < window.listedCourses.length; i++) {
        var course = window.listedCourses[i];
        if (course._id === courseID)
            return {idx : i, course : course};
    }
    return null;
}

function fetchUserBlockWithID(courseID) {
    for (var i = 0; i < window.userBlocks.length; i++) {
        var block = window.userBlocks[i];
        if (block._id === courseID)
            return {idx : i, block : block};
    }
    return null;
}

function refreshJQMElements() {
    $("#accordion").collapsibleset('refresh');
    $(".del").button();
    $(".info").button();
}

function refreshCalendar(courseChanged) {
    /* Re-render Events on FullCalendar */
    $("#calview").fullCalendar("clientEvents",
        function(eventToRemove) {
            if (eventToRemove.id === courseChanged._id) {
                window.events.removeObj(eventToRemove);
            }
        });

    $('#calview').fullCalendar('removeEventSource', window.events);
    addCourseToCalendar(courseChanged);
    $('#calview').fullCalendar('addEventSource', window.events);
}

function clearForm(form) {
    $(form).find("input").val("");
}

function getLatestEvent() {
    var latest = 0;
    for (var i = 0; i < window.events.length; i++) {
        var end = window.events[i].end.getHours();
        if (end > latest)
            latest = end;
    }
    return latest;
}
