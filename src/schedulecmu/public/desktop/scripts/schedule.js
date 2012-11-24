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

    /* Query database for 'inputStr' */

    /* Returns something like this */
    var course =
    {
            Num: '73-230',
            Sections: [
                {
                    Classes: [
                        {
                            End: '10:20a',
                            Loc: 'POS MN AUD',
                            Day: 'M',
                            Start: '9:00a'
                        },
                        {
                            End: '10:20a',
                            Loc: 'POS MN AUD',
                            Day: 'W',
                            Start: '9:00a'
                        }
                    ],
                    Num: 'Lec 1',
                    Subsections: [
                        {
                            Classes: [
                                {
                                    End: '10:20a',
                                    Loc: 'POS MN AUD',
                                    Day: 'F',
                                    Start: '9:00a'
                                }
                            ],
                            Num: 'A',
                            Instructor: 'Instructor TBA'
                        },
                        {
                            Classes: [
                                {
                                    End: '10:20a',
                                    Loc: 'SH 214',
                                    Day: 'F',
                                    Start: '9:00a'
                                }
                            ],
                            Num: 'B',
                            Instructor: 'Instructor TBA'
                        }
                    ],
                    Instructor: 'Groeger'
                },
                {
                    Classes: [
                        {
                            End: '11:50a',
                            Loc: 'POS MN AUD',
                            Day: 'M',
                            Start: '10:30a'
                        },
                        {
                            End: '11:50a',
                            Loc: 'POS MN AUD',
                            Day: 'W',
                            Start: '10:30a'
                        }
                    ],
                    Num: 'Lec 2',
                    Subsections: [
                        {
                            Classes: [
                                {
                                    End: '11:50a',
                                    Loc: 'POS MN AUD',
                                    Day: 'F',
                                    Start: '10:30a'
                                }
                            ],
                            Num: 'C',
                            Instructor: 'Instructor TBA'
                        },
                        {
                            Classes: [
                                {
                                    End: '11:50a',
                                    Loc: 'HH B131',
                                    Day: 'F',
                                    Start: '10:30a'
                                }
                            ],
                            Num: 'D',
                            Instructor: 'Instructor TBA'
                        }
                    ],
                    Instructor: 'Groeger'
                },
                {
                    Classes: [
                        {
                            End: '11:50a',
                            Loc: 'HH B131',
                            Day: 'M',
                            Start: '10:30a'
                        },
                        {
                            End: '11:50a',
                            Loc: 'HH B131',
                            Day: 'W',
                            Start: '10:30a'
                        }
                    ],
                    Num: 'Lec 3',
                    Subsections: [
                        {
                            Classes: [
                                {
                                    End: '11:50a',
                                    Loc: 'WEH 5421',
                                    Day: 'F',
                                    Start: '10:30a'
                                }
                            ],
                            Num: 'E',
                            Instructor: 'Instructor TBA'
                        },
                        {
                            Classes: [
                                {
                                    End: '11:50a',
                                    Loc: 'GHC 4307',
                                    Day: 'F',
                                    Start: '10:30a'
                                }
                            ],
                            Num: 'F',
                            Instructor: 'Instructor TBA'
                        }
                    ],
                    Instructor: 'Instructor TBA'
                },
                {
                    Classes: [
                        {
                            End: '10:20a',
                            Loc: 'CMB 1064',
                            Day: 'U',
                            Start: '9:30a'
                        },
                        {
                            End: '10:20a',
                            Loc: 'CMB 1064',
                            Day: 'T',
                            Start: '9:30a'
                        }
                    ],
                    Num: 'Lec 4',
                    Subsections: [
                        {
                            Classes: [
                                {
                                    End: '10:20a',
                                    Loc: 'CMB 1064',
                                    Day: 'R',
                                    Start: '9:30a'
                                }
                            ],
                            Num: 'W',
                            Instructor: 'Sileo'
                        },
                        {
                            Classes: [
                                {
                                    End: '1:50p',
                                    Loc: 'CMB 2152',
                                    Day: 'R',
                                    Start: '1:00p'
                                }
                            ],
                            Num: 'X',
                            Instructor: 'Sileo'
                        }
                    ],
                    Instructor: 'Sileo'
                }
            ],
            Name: 'Intermediate Microeconomics',
            Units: '9.0',
            Semester: 131
        };

    var courseNum = course.Num;
    var courseName = course.Name;
    var courseUnits = course.Units;

    var accordion = $("#accordion");

    /* Create <h3> for title */
    var title = $("<h3>").text(courseNum);

    /* Create contentHdr */
    var contentHdr = $("<div>").addClass("contentHdr");
    contentHdr.append($("<p>").text(courseName));
    var units = $("<p>").addClass("units").text(courseUnits + " units");
    var del = $("<p>").addClass("del").attr("onClick", "deleteCourse(this);").text("delete");
    var info = $("<p>").addClass("info").attr("onClick", "infoCourse(this);").text("info");
    contentHdr.append(units);
    contentHdr.append(del);
    contentHdr.append(info);
    contentHdr.append("<hr>");

    /* Create <table> for classes */
    var table = $("<table>");

    /* First append the header */
    var hdrRow = $("<tr>");
    hdrRow.append(newCol("Class"));
    hdrRow.append(newCol("Day"));
    hdrRow.append(newCol("Time"));
    table.append(hdrRow);

    /* Extract data from Course object, append into tr's and td's */
    var sectionsArr = course.Sections;
    if (sectionsArr !== undefined) {
        for (var i = 0; i < sectionsArr.length; i++) {
            var section = sectionsArr[i];
            var classesArr = section.Classes;

            /* Take care of the main lecture/class first */
            processClasses(classesArr, table, section.Num);

            /* Now take care of the subsections (recitations) */
            var subsectionsArr = section.Subsections;
            if (subsectionsArr !== undefined) {
                for (j = 0; j < subsectionsArr.length; j++) {
                    var subsection = subsectionsArr[j];
                    var subclassesArr = subsection.Classes;

                    processClasses(subclassesArr, table, subsection.Num);
                }
            }
        }
    }

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
    accordion.append(group).accordion('destroy').accordion(window.accordionOpts).sortable(window.accordionSortOpts);

    // var bgColor = title.css('background-color');

    // /* Render Event on Calendar Widget */
    // $('#calview').fullCalendar('renderEvent', {
    //     id: 999,
    //     title: courseNum,
    //     start: new Date(y, m, d, 16, 0),
    //     end: new Date(y, m, d, 18, 0),
    //     allDay: false,
    //     backgroundColor: bgColor
    // });
}

/* Some helper functions for processing courses */

/* Process the classes of a "section" (both lecture and recitation).
 * table is a jQuery object. num is the Num field of the section we're
 * processing. This function appends to the DOM in-place.
 */
function processClasses(classesArr, table, num) {
    if (areSameTime(classesArr) === true) {
        /* If all classes in this section start at the same time,
         * we only need 1 row.
         */
        var row = $("<tr>");

        /* Append the section number */
        row.append(newCol(num));
        
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
        var startTime = classesArr[0].Start;
        var endTime = classesArr[0].End;
        row.append(newCol(makeTimeStr(startTime, endTime)));

        /* Done. Append new row to the table */
        table.append(row);
    }
    else {
        /* Otherwise, need 1 row per day */
        for (var i = 0; i < classesArr.length; i++) {
            var row = $("<tr>");

            /* Append section num if first row, a space otherwise */
            if (i === 0) {
                row.append(newCol(num));
            }
            else {
                row.append(newCol("&nbsp;"));
            }

            /* Append the day */
            row.append(newCol(classesArr[i].Day));

            /* Append the time */
            var startTime = classesArr[i].Start;
            var endTime = classesArr[i].End;
            row.append(newCol(makeTimeStr(startTime, endTime)));

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
    // Get to enclosing group (3 levels up)
    var group = $(p).parent().parent().parent();

    // Remove the group then refresh accordion
    group.remove();
    $("#accordion").accordion('destroy').accordion(window.accordionOpts).sortable(window.accordionSortOpts);

    // Send updated course list to server
}

function infoCourse() {
    alert("Getting course info");
}