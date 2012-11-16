var jsdom = require('jsdom');

jsdom.env(
    "spring13.html",
    ['http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'],
    function(err, window){
        function isSubSection(row) {
            var children = window.$(row).children();

            if (window.$(children[0]).html() === "&nbsp;" && window.$(children[1]).html() === "&nbsp;" && window.$(children[2]).html() === "&nbsp;" && window.$(children[3]).html() !== "&nbsp;")
                return true;
            else
                return false;
        }

        var title = window.$("title").text();
        console.log("Scraping: " + title);

        var courses = [];
        
        // Loop through each <tr> row
        window.$("tr").each(function(index) {
            console.log("----------");
            // console.log(window.$(this).html());

            if (isSubSection(this) === true) {
                console.log("SAME!");
            }

            var course = new Course();

            // Loop through each <td> column
            window.$(this).children().each(function(index) {
                // In this scope, "this" = a column
                function extractHTML(elt) {
                    if (window.$(elt).children().html() === undefined)
                        return window.$(elt).html();
                    else
                        return window.$(elt).children().html();
                }

                if (index == 0) {
                    course.number = parseInt(extractHTML(this));
                }
                else if (index == 1) {
                    course.name = extractHTML(this);
                }
                else if (index == 2) {
                    course.units = parseInt(extractHTML(this));
                }
                else if (index == 3) {
                    course.section = extractHTML(this);
                }
                else if (index == 4) {
                    course.days = extractHTML(this);
                }
                else if (index == 5) {
                    course.start = extractHTML(this);
                }
                else if (index == 6) {
                    course.end = extractHTML(this);
                }
                else if (index == 7) {
                    course.location = extractHTML(this);
                }
                else if (index == 8) {
                    course.instructor = extractHTML(this);
                }

                               
            });

            courses.push(course);
            console.log(courses);

        });
});

// Course constructor
function Course() {
    this.number = 0;
    this.name = "";
    this.units = 0.0;
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