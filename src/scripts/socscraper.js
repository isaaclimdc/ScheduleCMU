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
var scheduleToScrape = "spring13.html";
// Comment out for network file
// var scheduleToScrape = "https://enr-apps.as.cmu.edu/assets/SOC/sched_layout_fall.htm";

// DB Stuff
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var db = require('./db.js').dbConnect(mongoose);
var CourseModel = require('./model.js').getCourseModel(Schema, db);


// Scraping Stuff
var jsdom = require("jsdom");
var inspect = require("eyes").inspector({
    maxLength: 100000000000    // Computers nowadays have big memories right?
});

function dumpAndAdd(arr, course) {
  CourseModel.create(course, function(err, saved) {
    if (err) {
      inspect(course);
      process.exit(1);
    }
  });
  arr.push(course);
}

jsdom.env(
    scheduleToScrape,
    ['http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'],
    function(err, window) {
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

        /* Convert a string like "Semester: Spring 2013" into a number 131. */
        function extractSemester(str) {
            var words = str.split(" ");
            var year = parseInt(words[words.length-1]);
            var sem = words[1];

            // We'll be good for 100 years
            var result = year % 100;

            // Move forward 1 digit
            result *= 10;

            if (sem === "Fall")
                result += 0;  // Fall = 0
            else if (sem === "Spring")
                result += 1;  // Spring = 1
            else if (sem === "Summer" && words[2] === "One")
                result += 2;  // Summer One = 2
            else if (sem === "Summer" && words[2] === "Two")
                result += 3;  // Summer Two = 3

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
            newCourse.Num = processCourseNum(extractHTML(cols[0]));
            newCourse.Name = extractHTML(cols[1]);
            newCourse.Units = processUnits(extractHTML(cols[2]));
            newCourse.Semester = globalSem;

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

            newClass.Day = day
            newClass.Start = processTime(extractHTML(cols[5]));
            newClass.End = processTime(extractHTML(cols[6]));
            newClass.Loc = extractHTML(cols[7]);

            return newClass;
        }

        /* Process the data in cols into a Section */
        function processSection(cols) {
            // Create new Section
            var newSection = new Section();

            // Get Section number, instructor
            var sectionNum = extractHTML(cols[3]);
            newSection.Num = sectionNum;
            newSection.Instructor = extractHTML(cols[8]);

            // Get Mini or not
            if (sectionNum.length === 2) {
                var miniNum = parseInt(sectionNum.substring(1, 2));
                newSection.Mini = (miniNum - 1) % 2;
            }

            var dayField = extractHTML(cols[4]);
            if (dayField === "TBA") {
                var newClass = processClass(cols, dayField);

                // newClass is fully populated. Add into classes array
                newSection.Classes.push(newClass);
            }
            else {
                // Process days. 1 day is 1 Class object
                for (var i = 0; i < dayField.length; i++) {
                  if (!/\s/.test(dayField.charAt(i))) {
                    var newClass = processClass(cols, dayField.charAt(i));

                    // newClass is fully populated. Add into classes array
                    newSection.Classes.push(newClass);
                  }
                }
            }

            return newSection;
        }

        /* Parser START */

        /* Print the title */
        var title = window.$("title").text();
        console.log("Scraping:" + title);

        /* Get semester */
        var semStr = window.$(window.$("b")[1]).text();
        var globalSem = extractSemester(semStr);
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
            /* Take care of ALL edge cases */
            if (rowIdx < 2) return true;
            if (isDeptHeader(this)) return true;
            var badCourse = extractHTML(cols[1]);
            if (badCourse === "3D Media Studio II:" ||
                badCourse === "Wearables" ||
                badCourse === "Move It" ||
                badCourse === "Multiples" ||)
                return true;

            // The array of the columns in this row
            var cols = window.$(this).children();

            if (isSection(this) === true) {
                /* This row starts a new Section */
                var sectionNum = extractHTML(cols[3]);

                // A lecture detected, so start a new Section
                if (sectionNum.substring(0, 3) === "Lec" || currentSection.Num.substring(0, 3) !== "Lec") {
                    // Before doing anything, push currentSection
                    currentCourse.Sections.push(currentSection);
                    currentSection = undefined;

                    // Create a new Section
                    var newSection = processSection(cols);
                    currentSection = newSection;
                }
                // A recitation/class detected, so create a new subsection
                else if (sectionNum.length === 1) {
                    var newSubSection = processSection(cols);
                    // newSubSection.Subsections is undefined;

                    if (currentSection.Subsections === undefined)
                        currentSection.Subsections = [];
                    currentSection.Subsections.push(newSubSection);
                }
            }
            else if (isClass(this) === true) {
                /* This row starts a new Class */

                var dayField = extractHTML(cols[4]);

                if (dayField === "TBA") {
                    var newClass = processClass(cols, dayField);

                    // newClass is fully populated. Add into classes array
                    currentSection.Classes.push(newClass);
                }
                else {
                    // Process days. 1 day is 1 Class object
                    for (var i = 0; i < dayField.length; i++) {
                      if (!/\s/.test(dayField.charAt(i))) {
                        var newClass = processClass(cols, dayField.charAt(i));

                    // newClass is fully populated. Add into classes array
                    currentSection.Classes.push(newClass);
                }
            }
        }
            }
            else {
                /* This row starts a new Course */

                // Before doing anything, push currentCourse
                if (currentSection !== undefined) {
                    currentCourse.Sections.push(currentSection);
                    currentSection = undefined;
                }

                if (currentCourse !== undefined && currentCourse.Num.length === 6) {
                    dumpAndAdd(allCourses, currentCourse);
                    currentCourse = undefined;
                }

                // Create a new Course
                if (extractHTML(cols[3]) === "&nbsp;") {
                var newCourse = processCourse(cols);
                currentCourse = newCourse;
            }

                // Create a new Section
                var newSection = processSection(cols);
                currentSection = newSection;
            }
        });

        // Push the last currentCourse
        if (currentCourse.Num.length === 6) {
            currentCourse.Sections.push(currentSection);
            dumpAndAdd(allCourses, currentCourse);
            currentCourse = undefined;
        }

        //inspect(allCourses);
});

/* Object constructors */

// Course constructor
function Course() {
    this.Num;
    this.Name;
    this.Units;
    this.Semester;
    this.Sections = [];
    return this;
}

// Section constructor
function Section() {
    this.Num;
    this.Mini;
    this.Instructor;
    this.Classes = [];
    this.Subsections;
    return this;
}

// Class constructor
function Class() {
    this.Day;
    this.Start;
    this.End;
    this.Loc;
    return this;
}
