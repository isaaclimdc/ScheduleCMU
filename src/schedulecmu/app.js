var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var app = express();


var db = require('./db.js').dbConnect(mongoose);
var Course = require('./model.js').getCourseModel(Schema, db);

app.get('/api/courses', function(req, res) {
  var query = Course.find({});
  if (req.query.dept) {
    query = query.$where(function() {
      return (Math.floor(this.Num/1000) == req.query.dept)
    });
  }
  if (req.query.name) {

  }
  if (req.query.number) {
    console.log("num");
    query = query.where('Num', parseInt(req.query.number));  
  }
  if (req.query.semester) {
    query = query.where('this.Semester', parseInt(req.query.semester));
  }
  if (req.query.mini) {
     query = query.where('this.Mini', parseInt(req.query.mini)); 
  }

  // Optional::
  if (req.query.instructor) {

  }
  if (req.query.building) {

  }

  query = query.select("-Sections");
  query.exec(function(err, courses) {
    if (err) {
      console.log(err);
    }
    for (var i = 0; i < courses.length; i++) {
      courses[i].CourseURL = "/api/courses/"
                           + courses[i]["Semester"]
                           + courses[i]["Num"];
    }
    res.send(JSON.stringify(courses));
  });
});

app.get('/api/courses/:course', function(req, res) {
  var semester = parseInt(req.params.course.slice(0,3));
  var course = parseInt(req.params.course.slice(3,8));
  Course.findOne({semester: semester, course: course}, function(err, course) {
    res.send(course); // TODO add error checking
  });
});



/* Serve static files from the public directory */
app.use(express.static('public'));
/* AppFog will pass the listen port as an env var called VCAP_APP_PORT */
app.listen(process.env.VCAP_APP_PORT || 3000);
