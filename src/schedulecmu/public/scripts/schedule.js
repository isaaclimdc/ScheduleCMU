/* Set up globals */

/* Sets this global flag to whether the current browser is a
 * mobile browser or not, so that we can case on it if necessary.
 */
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

/* Base URL for the API */
window.baseURL = "http://schedulecmu.aws.af.cm/api";

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
    // window.userBlocks =
    // [
    //     {"id" : "50b9916e01b1568d25000ad6", "section" : 1, "subsection" : 3},
    //     {"id" : "50b9916f01b1568d25002117", "section" : 0, "subsection" : 0},
    //     {"id" : "50b9916f01b1568d25001d40", "section" : 0, "subsection" : 0},
    //     {"id" : "50b9916f01b1568d250012e9", "section" : 1, "subsection" : 3},
    //     {"id" : "50b9916e01b1568d250004e4", "section" : 2, "subsection" : 0}
    // ];

    /* Set up the DOM first */
    setupPage();
    
    var schedulesArr = user.schedules;

    /* If there are existing schedules for this user, fetch them
     * and populate the page
     */
    if (schedulesArr.length > 0) {
        var latestSchedule = schedulesArr[0];

        $('#semTitle').text(convertSemToReadable(latestSchedule.semester));
        $('#scheduleVersion').text(latestSchedule.name);

        window.userBlocks = latestSchedule.course_blocks;
        console.log("User Blocks: ", window.userBlocks);

        fetchCourseData();
    }
    /* Otherwise, create a new schedule */
    else {
        performAjaxRequest({
            type : "POST",
            url : "/users/" + user._id + "/schedules/",
            data : {
                "semester" : 130,  /* Placeholder */
                "name" : "Schedule 1"
            },
            success : function(result, status) {
                console.log(result);
            }
        });
    }
}

function setupPage() {
    $("#eventFormDate").datePicker();

    var height;
    var contentHeight;

    /* Setup for DESKTOP client */
    if (window.isMobile === false) {
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
        $("#eventForm").submit(function(e){
            e.preventDefault();
            processEventForm();
        });
        $(".courseBrowserRow img").click(function(e) {
            e.stopPropagation();
        });

        /* Options for DESKTOP FullCalendar */
        height = 800;
    }

    /* Setup for MOBILE client */
    else {
        /* Options for MOBILE FullCalendar */
        contentHeight = $(document).height() - $('#gridviewheader').height();
        height = contentHeight;
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
        columnFormat: {
            month: 'ddd',
            week: 'ddd',
            day: 'ddd'
        },
        timeFormat: {
            /* Don't display time in title in agenda view */
            agenda: ''
        },
        events: window.events
    });
}

function fetchCourseData() {
    for (var i = 0; i < window.userBlocks.length; i++) {
        performAjaxRequest({
            url: "/courses/" + window.userBlocks[i].course_id,
            success: function(result, status) {
                var course = result;
                // console.log(course);

                if (course === null) {
                    return;
                }

                window.listedCourses.push(course);
                
                addCourseToAccordion(course);
                addCourseToCalendar(course);
            }
        });
    }
}

/**** FullCalendar ****/

/* Adds a single course to FullCalendar */
function addCourseToCalendar(course) {
    // var sem = parseInt(course.semester);
    var sem = parseInt("122"); /* Override for debugging */
    var sectionsToAdd;
    var color;
    for (var i = 0; i < window.userBlocks.length; i++) {
        if (window.userBlocks[i].course_id === course._id) {
            sectionsToAdd = window.userBlocks[i];
        }
    }

    for (var i = 0; i < window.listedCourses.length; i++) {
        if (window.listedCourses[i]._id === course._id) {
            if (i == 0) color = "#D96C6E";
            else if (i == 1) color = "#BEFF7A";
            else if (i == 2) color = "#9ECFFF";
            else if (i == 3) color = "#FFF257";
            else if (i == 4) color = "#C891FF";
            else if (i == 5) color = "#FFBE69";
            else if (i == 6) color = "#FF9EC5";
            else if (i == 7) color = "#CFCFCF";
            else if (i == 8) color = "#69FF6B";
            else if (i == 9) color = "#8FFFFD";
            else color = "#D96C6E";
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

    var sectionsArr = course.sections;
    if (sectionsArr.length !== 0) {
        var section = sectionsArr[sectIdxToAdd];
        addClassesToCalendar(section, course, color, sem);
    }
    var subsectionsArr = section.subsections;
    if (subsectionsArr.length !== 0) {
        var subsection = subsectionsArr[subsectIdxToAdd];
        addClassesToCalendar(subsection, course, color, sem);
    }

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

/*** Accordion ***/

/* Called when the user presses "return" at the add course box. Queries
 * our database and parses the response into the accordion and calview
 */
function requestAndAddCourse() {
    /* Remove all whitespace from query string */
    var inputStr = $("#addCourseBox").val();
    inputStr = inputStr.replace(/\s/g,'');

    /* Can be "15251" or "15-251". Parsed server-side */
    var urlReq = "/courses?number=" + inputStr;

    /* Query database for 'inputStr' */
    performAjaxRequest({
        url : urlReq,
        success : function(result, status) {
            var addCourseBox = $('#addCourseBox').val("");

            /* Helper to set the placeholder of the addCourseBox */
            function setPlaceholder(str) {
                return addCourseBox.attr("placeholder", str);
            }

            setPlaceholder("Searching...");

            if (result.length === 0) {
                setPlaceholder("Course not found!");
                return;
            }

            /* ID of the course we want to add */
            var courseID = result[0]._id;

            /* Check if this course is already in the existing courses */
            for (var i = 0; i < window.userBlocks.length; i++) {
                if (window.userBlocks[i].course_id === courseID) {
                    setPlaceholder("Course already added");
                    return;
                }
            }

            performAjaxRequest({
                url : "/courses/" + courseID,
                success : function(result, status) {
                    var course = result;

                    setPlaceholder(course.num + " added!");

                    window.listedCourses.push(course);

                    window.userBlocks.push({
                        "course_id" : course._id,
                        "section" : 0,
                        "subsection" : 0
                    });

                    if (window.isMobile === false)
                        addCourseToAccordion(course);

                    addCourseToCalendar(course);
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

    /* Create <h3> for title */
    var title = $("<h3>").text(courseNum);
    title.attr("id", course._id);

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

    if(window.isMobile === false) {
        /* Append title h3 then content div into a group */
        var group = $("<div>").addClass("group");
        group.append(title);
        group.append(content);

        /* Append group into accordion and refresh. Expand the recently added */
        window.accordionOpts.active = "h3:last";
        accordion.append(group).accordion('destroy').accordion(window.accordionOpts);
    }
    else {
        var group = $("<div data-role='collapsible' data-content-theme='a'>");
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
function rowSelected(tr) {
    var row = $(tr)
    var sectIdx = parseInt(row.attr("sect"));
    var subsectIdx = parseInt(row.attr("subsect"));

    if (isNaN(subsectIdx))
        subsectIdx = -1;

    var clickedIndex = row.parent().parent().parent().parent().index();

    var course = window.listedCourses[clickedIndex];
    for (var i = 0; i < window.userBlocks.length; i++) {
        if (window.userBlocks[i].course_id === course._id) {
            window.userBlocks[i].section = sectIdx;
            window.userBlocks[i].subsection = subsectIdx;
            break;
        }
    }

    /* Re-render Events on FullCalendar */
    $("#calview").fullCalendar("clientEvents",
        function(eventToRemove) {
            if (eventToRemove.id === course._id) {
                window.events.removeObj(eventToRemove);
            }
        });

    $('#calview').fullCalendar('removeEventSource', window.events);
    addCourseToCalendar(course);
    $('#calview').fullCalendar('addEventSource', window.events);
}

/* Called when "delete" is clicked */
function deleteCourse(p) {
    /* Get to enclosing group (3 levels up) */
    var group = $(p).parent().parent().parent();
    var clickedIndex = $(group).index();

    // Remove the group then refresh accordion
    group.remove();
    $("#accordion").accordion('destroy').accordion(window.accordionOpts);

    var course = window.listedCourses[clickedIndex];

    // Send updated course list to server
    window.listedCourses.splice(clickedIndex, 1);

    window.userBlocks = $.grep(window.userBlocks, function(elt, idx) {
        if (elt.course_id === course._id) {
            return false;
        }
        return true;
    });

    $("#calview").fullCalendar("clientEvents",
        function(eventToRemove) {
            if (eventToRemove.id === course._id) {
                window.events.removeObj(eventToRemove);
            }
        });

    /* POST HERE */

    /* Refresh FullCalendar */
    $('#calview').fullCalendar('refetchEvents');
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
    inputStr = inputStr.replace(/\s/g,'');

    /* Can be "15251" or "15-251". Parsed server-side */
    var urlReq;
    if (inputStr.length <= 2)
        urlReq = "/courses?number=" + inputStr;
    else
        urlReq = "/courses?number=" + inputStr;

    /* Query our server */
    performAjaxRequest({
        url: urlReq,
        success: function(result, status) {
            console.log(result);

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
    row.append($('<h3>').text(makeUnitsStr(course.units)));
    row.append($('<img>').attr({
        "src" : "../images/plus.png",
        "onClick" : "addToAccordionFromBrowser(this)"
    }));

    $('#courseBrowserBody').append(row);
}

function addToAccordionFromBrowser(img) {
    var clickedIndex = $(img).parent().index();
    var course = window.mostRecentSearchResults[clickedIndex];
    window.listedCourses.push(course);

    addCourseToAccordion(course);
}

/*** EventBrowser ***/

if (window.isMobile === false ) {
    $("#eventsLink").fancybox({
        "scrolling" : "no",
        "titleShow" : false,
    });
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
        var dateArr = $("#eventFormDate").val().split("/");
        var startDate = new Date(parseInt(dateArr[2]), parseInt(dateArr[0]), parseInt(dateArr[1]), startArr[0], startArr[1]);
        var endDate = new Date(parseInt(dateArr[2]), parseInt(dateArr[0]), parseInt(dateArr[1]), endArr[0], endArr[1]);

        /* Parse course num */
        courseNum = courseNum.substring(0, 2) + "-" + courseNum.substring(2);

        /* Get the course ID */
        performAjaxRequest({
            url : "/courses?number=" + courseNum,
            success : function(res, sta) {
                console.log(res);
                var courseID = res[0]._id;

                /* POST the new event to this course ID */
                performAjaxRequest({
                    type : "POST",
                    url : "/courses/" + courseID + "/events",
                    data : {
                        "event_type" : type,
                        "title" : title,
                        "loc" : location,
                        "start" : startDate.toString(),
                        "end" : endDate.toString()
                    },
                    success : function(result, status) {
                        console.log(result);

                        /* When done, close the fancybox dialog */
                        if (window.isMobile === false) 
                            $.fancybox.close(false);
                    }
                });
            }
        });

        
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
    if (res.location.length === 0) {
        toChange.push("#eventFormLocation");
    }
    if (res.date.length === 0) {
        toChange.push("#eventFormDate");
    }
    else {
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

/**** ShareView ****/

if (window.isMobile === false ) {
    $("#shareLink").fancybox({
        "scrolling" : "no",
        "titleShow" : false,
    });
}

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

/**** CourseInfo ****/

if(window.isMobile === false ) {
    $("#courseInfoLink").fancybox({
        "scrolling" : "no",
        "titleShow" : false,
    });
}

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

/*** Without description scraping ***/
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
    body.append($("<h3>").text("Description"));
    body.append($("<p>").text("Lorem Ipsum"));
    body.append($("<h3>").text("Prerequisites"));
    body.append($("<p>").text("Lorem Ipsum"));
    body.append($("<h3>").text("Corequisites"));
    body.append($("<p>").text("Lorem Ipsum"));

    /* Done, append the whole body */
    browser.append(body);

    /* Done. Append it anywhere in content */
    $("#content").append(browser);

    /* Open it */
    $("#courseInfoLink").click();
/*** Without description scraping ***/

/*** With description scraping ***/
    /* TODO: We need to transfer all this server-side */
    // var num = course.num.replace("-", "");

    // var semStr;
    // var semNum = course.semester % 10;
    // if (semNum === 0)
    //     semStr = "S";  /* Spring */
    // else if (semNum === 1)
    //     semStr = "M";  /* Summer */
    // else if (semNum === 2)
    //     semStr = "F";  /* Fall */
    // semStr += course.semester / 10;
    // console.log(semStr);
    // 
    // performAjaxRequest({
    //     customurl : "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet?CourseNo=" + num + "&SEMESTER=" + semStr + "&Formname=Course_Detail",
    //     success : function(result, status) {
    //         /* Pulling out the desc, prereq, coreq text */
    //         var page = $(result);
    //         var allP = page.find("p");
    //         var descHdr = $(allP[2]).children("font");
    //         var desc = $(descHdr[0]).text();
    //         var prereqs = $(descHdr[2]).text();
    //         var coreqHdr = $(allP[3]).children("font")[0];
    //         var coreqs = $($(coreqHdr).children("font")[0]).text().replace(/\s/g,'');

    //         /* Create the modal view and populate with the desired course */
    //         var browser = $('#courseInfoBrowser');
    //         if (browser.length === 0) {
    //             browser = $("<div>").attr({
    //                 "id": "courseInfoBrowser",
    //                 "style": "display:none"
    //             });
    //         }
    //         else {
    //             browser.empty();
    //         }

    //         var header = $("<div>").attr("id", "courseInfoHeader");
    //         var headerNum = $("<h2>").text(course.num);
    //         var headerName = $("<h3>").text(course.name);
    //         var headerUnits = $("<h4>").text(makeUnitsStr(course.units));

    //         header.append(headerNum);
    //         header.append(headerName);
    //         header.append(headerUnits);
    //         header.append($("<hr>"));

    //         browser.append(header);

    //         var body = $("<div>").attr("id", "courseInfoBody");
    //         var table = $("<table>");

    //         /* Here fullDetails = true because we want all details */
    //         insertCourseIntoTable(course, table, true);

    //         /* Append the completed table */
    //         body.append(table);

    //         /* Append other course details */
    //         body.append($("<h3>").text("Description"));
    //         body.append($("<p>").text(desc));
    //         body.append($("<h3>").text("Prerequisites"));
    //         body.append($("<p>").text(prereqs));
    //         body.append($("<h3>").text("Corequisites"));
    //         body.append($("<p>").text(coreqs));

    //         /* Done, append the whole body */
    //         browser.append(body);

    //         /* Done. Append it anywhere in content */
    //         $("#content").append(browser);

    //         /* Open it */
    //         $("#courseInfoLink").click();
    //     }
    // });
/*** With description scraping ***/
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