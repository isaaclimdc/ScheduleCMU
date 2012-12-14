/*
 * ScheduleCMU
 *
 * SOC Scraper
 *
 * Pulls data from the URL provided at scheduleToScrape. Must be from the
 * official Schedule of Classes. Outputs an array of "Course" objects. The
 * underlying data structure is as detailed in "dataStructure.js". 
 */

// Comment out for local file
var scheduleToScrape = "testing/spring13.html";
// Comment out for network file
// var scheduleToScrape = "https://enr-apps.as.cmu.edu/assets/SOC/sched_layout_fall.htm";

// DB Stuff
var mongoose = require('mongoose');

var db = require('./db.js').dbConnect(mongoose);
var CourseModel = require('./model.js')(mongoose, db);


// Scraping Stuff
var jsdom = require("jsdom");
var inspect = require("eyes").inspector({
    maxLength: 100000000000    // Computers nowadays have big memories right?
});
var request = require('request');

var total = 0;
var totalSaved = 0;

jsdom.env(
    scheduleToScrape,
    ['http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'],
    function(err, window) {
        if (err) {
          console.log(err);
          return;
        }
        /* Helper functions */

        /* Identify if a row contains data about a section */
        function isSection(row) {
            var children = window.$(row).children();

            if (window.$(children[0]).html() === "&nbsp;" &&
                window.$(children[1]).html() === "&nbsp;" &&
                window.$(children[2]).html() === "&nbsp;" &&
                window.$(children[3]).html() !== "&nbsp;")
                return true;
            else
                return false;
        }

        /* Identify if a row contains data about a class */
        function isClass(row) {
            var children = window.$(row).children();

            if (window.$(children[0]).html() === "&nbsp;" &&
                window.$(children[1]).html() === "&nbsp;" &&
                window.$(children[2]).html() === "&nbsp;" &&
                window.$(children[3]).html() === "&nbsp;")
                return true;
            else
                return false;
        }

        /* A way to ignore department headers */
        function isDeptHeader(row) {
            var children = window.$(row).children();

            if (window.$(children[0]).html() === "&nbsp;")
                return false;

            for (var i = 1; i < children.length; i++)
                if (window.$(children[i]).html() !== "&nbsp;")
                    return false;
            
            return true;
        }

        /* Pull out just the raw text */
        function extractHTML(elt) {
            return window.$(elt).html();
        }

        /* Convert a string like "Semester: Spring 2013" into a number 130. */
        function extractSemester(str) {
            var words = str.split(" ");
            var year = parseInt(words[words.length-1]);
            var sem = words[1];

            var result = year % 100;

            // Move forward 1 digit
            result *= 10;

            if (sem === "Spring")
                result += 0;  // Spring = 0
            else if (sem === "Summer")
                result += 1;  // Summer = 1
            else if (sem === "Fall")
                result += 2;  // Fall = 2

            return result;
        }

        /* Process the data in cols into a Course */
        function processCourse(cols) {
            function processCourseNum(numStr) {
                /* "15237" is length 5. They should all be like this.
                 * If not, return numStr unchanged.
                 */
                if (numStr.length !== 5)
                    return numStr;

                var dept = numStr.substring(0, 2);
                var course = numStr.substring(2);

                return dept + "-" + course;
            }

            //TODO change how we store units?
            function processUnits(unitsStr) {
                return unitsStr;
            }

            // Create a new Course
            var newCourse = new Course();

            // Get number, name, units, semester
            var courseNum = extractHTML(cols[0]);
            newCourse.num = processCourseNum(courseNum);
            newCourse.name = extractHTML(cols[1]);
            newCourse.units = processUnits(extractHTML(cols[2]));
            newCourse.semester = window.globalSem;

            return newCourse;
        }

        /* Process the data in cols into a Class for a specific day */
        function processClass(cols, day) {
            function processTime(timeStr) {
                /* "02:50PM" is length 7. They should all be like
                 * this. If not, return timeStr unchanged.
                 */
                if (timeStr.length !== 7)
                    return timeStr;

                var hours = (timeStr.substring(0, 1) === "0") ?
                            timeStr.substring(1, 2) :
                            timeStr.substring(0, 2);
                var mins = timeStr.substring(3, 5);
                var ampm = (timeStr.substring(5, 7) === "AM") ? "a" : "p";

                return hours + ":" + mins + ampm;
            }

            var newClass = new Class();

            newClass.day = day
            newClass.start = processTime(extractHTML(cols[5]));
            newClass.end = processTime(extractHTML(cols[6]));
            newClass.loc = extractHTML(cols[7]);

            return newClass;
        }

        /* Process the data in cols into a Section */
        function processSection(cols) {
            // Create new Section
            var newSection = new Section();

            // Get Section number, instructor
            var sectionNum = extractHTML(cols[3]);
            newSection.num = sectionNum;
            newSection.instructor = extractHTML(cols[8]);

            // Get Mini or not
            if (sectionNum.length === 2) {
                var miniNum = parseInt(sectionNum.substring(1, 2));
                if (miniNum <= 4)
                    newSection.mini = (miniNum - 1) % 2;
            }

            var dayField = extractHTML(cols[4]);
            if (dayField === "TBA") {
                var newClass = processClass(cols, dayField);

                // newClass is fully populated. Add into classes array
                newSection.classes.push(newClass);
            }
            else {
                // Process days. 1 day is 1 Class object
                for (var i = 0; i < dayField.length; i++) {
                  if (!/\s/.test(dayField.charAt(i))) {
                    var newClass = processClass(cols, dayField.charAt(i));

                    // newClass is fully populated. Add into classes array
                    newSection.classes.push(newClass);
                  }
                }
            }

            return newSection;
        }

        function fetchDetails(num, onSuccess) {
            console.log("Entered fetch");

            var semStr;
            var semNum = window.globalSem % 10;
            if (semNum === 0)
                semStr = "S";  /* Spring */
            else if (semNum === 1)
                semStr = "M";  /* Summer */
            else if (semNum === 2)
                semStr = "F";  /* Fall */
            semStr += window.globalSem / 10;
            console.log("Sem string is: ", semStr);

            num = num.replace("-", "");

            var urlStr = "https://enr-apps.as.cmu.edu/open/SOC/SOCServlet?CourseNo=" + num + "&SEMESTER=" + semStr + "&Formname=Course_Detail";
            console.log(urlStr);
            
            /* Call AJAX Synchronously to get the response text */
            request(urlStr, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("Success!: ", body);
                    console.log("Response: ", response);

                    /* Pulling out the desc, prereq, coreq text */
                    var desc;   /* We need these */
                    var prereqs;
                    var coreqs;

                    var page = window.$(body);
                    var allP = page.find("p");
                    var descHdr = window.$(allP[2]).children("font");
                    desc = window.$(descHdr[0]).text();
                    prereqs = window.$(descHdr[2]).text();

                    var coreqHdr = window.$(allP[3]).children("font")[0];
                    coreqs = window.$(window.$(coreqHdr).children("font")[0]).text().replace(/\s/g,'');

                    /* Return this data as an object */
                    var res = {
                        "description" : desc,
                        "prereqs" : prereqs,
                        "coreqs" : coreqs
                    };

                    console.log("Finished fetch");
                    onSuccess(res);
                }
                else {
                    console.log("Error: ", error);
                }
            });
        }

        function dumpAndAdd(arr, course) {
            total++;
            fetchDetails(course.num, function(res) {
                course.details = res;
                var modeled = new CourseModel(course);
                modeled.save(function(err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    inspect(course);
                    arr.push(course);
                    totalSaved++;
                });

                console.log("Finished dump");
            });
        }

        /****************************/
        /**** Parser STARTS here ****/
        /****************************/

        /* Print the title */
        var title = window.$("title").text();
        console.log("Scraping:" + title);

        /* Get semester */
        var semStr = window.$(window.$("b")[1]).text();
        window.globalSem = extractSemester(semStr);
        console.log(semStr);

        /* Use Regex to add missing <tr> tags */
        var str = window.$("table").html();
        var regex = /(\<\/tr\>){1}(\s)+(\<td)+/gi;
        window.$("table").html(str.replace(regex, "</tr>\n<tr><td"));
        
        var allCourses = [];
        var currentCourse;
        var currentSection;
        
        // Loop through each <tr> row
        window.$("tr").each(function(rowIdx) {
            if (rowIdx < 2) return true;
            if (isDeptHeader(this)) return true;

            // The array of the columns in this row
            var cols = window.$(this).children();

            if (isSection(this) === true) {
                /* This row starts a new Section */
                var sectionNum = extractHTML(cols[3]);

                // A lecture detected, so start a new Section
                if (sectionNum.substring(0, 3) === "Lec" || currentSection.num.substring(0, 3) !== "Lec") {
                    // Before doing anything, push currentSection
                    currentCourse.sections.push(currentSection);
                    currentSection = undefined;

                    // Create a new Section
                    var newSection = processSection(cols);
                    currentSection = newSection;
                }
                // A recitation/class detected, so create a new subsection
                else if (sectionNum.length === 1) {
                    var newSubSection = processSection(cols);
                    // newSubSection.Subsections is undefined;

                    if (currentSection.subsections === undefined)
                        currentSection.subsections = [];
                    currentSection.subsections.push(newSubSection);
                }
            }
            else if (isClass(this) === true) {
                /* This row starts a new Class */

                var dayField = extractHTML(cols[4]);

                if (dayField === "TBA") {
                    var newClass = processClass(cols, dayField);

                    // newClass is fully populated. Add into classes array
                    currentSection.classes.push(newClass);
                }
                else {
                  // Process days. 1 day is 1 Class object
                    for (var i = 0; i < dayField.length; i++) {
                        if (!/\s/.test(dayField.charAt(i))) {
                            var newClass = processClass(cols, dayField.charAt(i));

                            // newClass is fully populated. Add into classes array
                            currentSection.classes.push(newClass);
                        }
                    }
                }
            }
            else {
                /* This row starts a new Course */

                // Before doing anything, push currentSection into currentCourse, then finish currentCourse.
                if (currentSection !== undefined) {
                    currentCourse.sections.push(currentSection);
                    currentSection = undefined;
                }

                if (currentCourse !== undefined && currentCourse.num.length === 6) {
                    dumpAndAdd(allCourses, currentCourse);
                    currentCourse = undefined;
                }

                // Create a new Course
                var newCourse = processCourse(cols);
                currentCourse = newCourse;

                // Create a new Section
                var newSection = processSection(cols);
                currentSection = newSection;
            }
        });

        // Push the last currentCourse
        if (currentCourse.num.length === 6) {
            currentCourse.sections.push(currentSection);
            dumpAndAdd(allCourses, currentCourse);
            currentCourse = undefined;
        }

        console.log(total);
        console.log(totalSaved);
        //inspect(allCourses);
});

/* Object constructors */

// Course constructor
function Course() {
    this.num;
    this.name;
    this.description;
    this.units;
    this.semester;
    this.sections = [];
    return this;
}

// Section constructor
function Section() {
    this.num;
    this.mini;
    this.instructor;
    this.classes = [];
    this.subsections;
    return this;
}

// Class constructor
function Class() {
    this.day;
    this.start;
    this.end;
    this.loc;
    return this;
}