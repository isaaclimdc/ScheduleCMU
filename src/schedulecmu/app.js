var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var app = express();


var db = require('./db.js').dbConnect(mongoose);
var Course = require('./model.js').getCourseModel(Schema, db);

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

  query = query.select("Num Semester -_id");
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


//For the form /api/courses/131-15-122
app.get('/api/courses/:course', function(req, res) {
  var semester = parseInt(req.params.course.slice(0,3));
  var course = req.params.course.slice(4,10);
  var next = req.params.course.slice(9) + '/'; //TODO: add this '/' only if it's not at the end
  Course.findOne({Semester: semester, Num: course}, function(err, course) {
	  if(next.length > 2 && next.slice(2).match(/^section/)){
	      var delimit = next.slice(10).indexOf('/'); //TODO: Error check here - this is unsafe
	      if (delimit == -1)
		  console.log("ERROR"); //TODO: throw an error
	      else {
		  var secNum = next.slice(10, delimit);
		  var section = course.Sections.findOne({Num: secNum});
		  var next1 = next.slice(delimit);
		  if(next1.length > 1 && next1.slice(1).match(/^subsection/)){
		      var delimit = next.slice(12).indexOf('/');
		      if (delimit == -1)
			  console.log("ERROR"); //TODO: throw an error                                                                                              
		      else {
			  var subsecNum = next.slice(12, delimit);
			  var subsection = section.Subsections.findOne({Num: subSecNum});
			  res.send(subsection);
		      }
		  }
		  else
		      res.send(section);
	      }
	  }
	  else   
	     res.send(course); // TODO add error checking
  });
});

app.use(function(err, req, res, next){
	console.log("ERROR");
	console.error(err.stack);
    });


/* Serve static files from the public directory */
app.use(express.static('public'));
/* AppFog will pass the listen port as an env var called VCAP_APP_PORT */
app.listen(process.env.VCAP_APP_PORT || 3000);
