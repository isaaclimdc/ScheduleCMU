var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var app = express();


var db = require('./db.js').dbConnect(mongoose);
var Course = require('./model.js')(mongoose, db);

app.get('/api/courses', function(req, res) {
  var query = Course.find({});
  if (req.query.dept) {
      query = query.$where('this.Num.match(/^' + req.query.dept + '/)'); 
  }
  if (req.query.name) {

  }
  if (req.query.number) {
    query = query.where('Num', req.query.number);  
  }
  if (req.query.semester) {
    query = query.where('Semester', parseInt(req.query.semester));
  }
  // TODO figure out how to check for minis (best way)
  // Optional::

  if (req.query.instructor) {

  }

  if (req.query.building) {

  }

  query = query.select("Num Semester _id");
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

app.get('/api/courses/:course/sections/:section/subsections/:subsec',
        function(req, res) {
  //TODO what if courses isn't 10 characters?
  var course = req.params.course
  var section = req.params.section.replace("-"," ");
  var subsection = req.params.subsec;
  console.log(subsection);

  Course.findById(course, function(err, course) {
    if (err) {
      console.log(err);
      res.send(404);
    } else {
      res.send(course.sections.id(section).subsections.id(subsection));
    }
  });
});

app.get('/api/courses/:course/sections/:section', function(req, res) {
  //TODO what if courses isn't 10 characters?
  var course = req.params.course;
  var section = req.params.section.replace("-"," ");
  console.log(section);

  Course.findById(course, function(err, course) {
    if (err) {
      console.log(err);
      res.send(404);
    } else {
      res.send(course.sections.id(section));
    }
  });
});

//For the form /api/courses/131-15-122
app.get('/api/courses/:course', function(req, res) {
  var course = req.params.course;
  console.log(course);
  Course.findById(course, function(err, course) {
    if (err) {
      console.log(err);
      res.send(404);
    } else {
	    res.send(course);
    }
  });
});


/* Serve static files from the public directory */
app.use(express.static('public'));
/* AppFog will pass the listen port as an env var called VCAP_APP_PORT */
app.listen(process.env.VCAP_APP_PORT || 3000);
