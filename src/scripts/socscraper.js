/*
 * ScheduleCMU
 *
 * SOC Scraper
 *
 * Pulls data from the URL provided at urlToScrape. Must be from the official
 * Schedule of Classes. Outputs an array of "Course" objects, each with
 * the following format:
 *
   { number: '48505',
     name: 'Architecture Design Studio: Thesis',
     units: '18.0',
     classes: 
     [ [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object] ] }
 *
 * Each object within the "classes" array is a "Class" object with the
 * following format:
 *
   { section: 'A',
     days: 'MWF',
     start: '01:30PM',
     location: 'MM 308',
     instructor: 'Danes',
     end: '04:20PM' }
 * 
 */

// Comment out for local file
var scheduleToScrape = "spring13.html";
// Comment out for network file
// var scheduleToScrape = "https://enr-apps.as.cmu.edu/assets/SOC/sched_layout_fall.htm";

var jsdom = require('jsdom');
jsdom.env(
    scheduleToScrape,
    ['http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'],
    function(err, window) {
        /* Helper functions */
        function isSubSection(row) {
            var children = window.$(row).children();

            if (window.$(children[0]).html() === "&nbsp;" && window.$(children[1]).html() === "&nbsp;" && window.$(children[2]).html() === "&nbsp;")
                return true;
            else
                return false;
        }

        /* Print the title */
        var title = window.$("title").text();
        console.log("Scraping: " + title);

        /* Use Regex to add missing <tr> tags */
        var str = window.$("table").html();
        var regex = /(\<\/tr\>){1}(\s)+(\<td)+/gi;
        window.$("table").html(str.replace(regex, "</tr>\n<tr><td"));
        
        // console.log(window.$("table").html());
        var courses = [];
        var currentCourse;
        
        // Loop through each <tr> row
        window.$("tr").each(function(rowIndex) {

            if (isSubSection(this) === true) {
                // Parse last 6 cols as a new Class and add to currentCourse
                var newClass = new Class();

                // Loop through each <td> column
                window.$(this).children().each(function(colIndex1) {
                    // In this scope, "this" = a column
                    var elt = window.$(this).html();

                    if (colIndex1 == 3) {
                        newClass.section = elt;
                    }
                    else if (colIndex1 == 4) {
                        newClass.days = elt;
                    }
                    else if (colIndex1 == 5) {
                        newClass.start = elt;
                    }
                    else if (colIndex1 == 6) {
                        newClass.end = elt;
                    }
                    else if (colIndex1 == 7) {
                        newClass.location = elt;
                    }
                    else if (colIndex1 == 8) {
                        newClass.instructor = elt;
                    }
                });

                currentCourse.classes.push(newClass);
            }
            else {
                // Push currentCourse
                if (currentCourse != undefined && !isNaN(currentCourse.number))
                    courses.push(currentCourse);

                // Make new course
                var newCourse = new Course();
                var newClass = new Class();

                // Loop through each <td> column
                window.$(this).children().each(function(colIndex2) {
                    // In this scope, "this" = a column
                    var elt = window.$(this).html();

                    if (colIndex2 == 0) {
                        newCourse.number = elt;
                    }
                    else if (colIndex2 == 1) {
                        newCourse.name = elt;
                    }
                    else if (colIndex2 == 2) {
                        newCourse.units = elt;
                    }
                    else if (colIndex2 == 3) {
                        newClass.section = elt;
                    }
                    else if (colIndex2 == 4) {
                        newClass.days = elt;
                    }
                    else if (colIndex2 == 5) {
                        newClass.start = elt;
                    }
                    else if (colIndex2 == 6) {
                        newClass.end = elt;
                    }
                    else if (colIndex2 == 7) {
                        newClass.location = elt;
                    }
                    else if (colIndex2 == 8) {
                        newClass.instructor = elt;
                    }
                });

                newCourse.classes.push(newClass);
                currentCourse = newCourse;
            }
        
        });

        // Push the last currentCourse
        if (!isNaN(currentCourse.number))
            courses.push(currentCourse);

        console.log(courses);
});

/* Object constructors */

// Course constructor
function Course() {
    this.number = 0;
    this.name = "";
    this.units = "0.0";
    this.classes = [];
    return this;
}

// Class constructor
function Class() {
    this.section = "";
    this.days = "";
    this.start = "";
    this.location = "";
    this.instructor = "";
    return this;
}