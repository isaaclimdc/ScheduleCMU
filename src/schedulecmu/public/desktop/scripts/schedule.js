$(document).ready(function() {
    $(function() {
        $( "#accordion" ).accordion();
    });
});

function addCourse() {
    var inputStr = $("#addCourseBox").val();
    alert("Adding " + inputStr + "...");

    // Query database for 'inputStr'

    var accordion = $("#accordion");

    // Create <h3> for title
    var title = $("<h3>").text("15-237");

    // Create <table> for classes
    var table = $("<table>");

    // Extract data from Course object, append into tr's and td's

    // Append table into a div
    var content = $("<div>");
    content.append(table);

    // Append h3 then that div into 'accordion'
    accordion.append(title);
    accordion.append(content);
}

function browseCourses() {
    alert("Browse!");
    // Open modal sheet to browse courses
}

function openEventSheet() {
    alert("Events!");
    // Open modal sheet for course events
}

function openShareSheet() {
    alert("Share!");
    // Open modal sheet for sharing services
}