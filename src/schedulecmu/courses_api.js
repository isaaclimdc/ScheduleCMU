 module.exports = function (app, Course) {
  app.get('/api/courses', function(req, res) {
    var query = Course.find({});
    if (req.query.dept) {
        query = query.$where('this.num.match(/^' + req.query.dept + '/)');
    }
    if (req.query.name) {

    }
    if (req.query.number) {
	if(req.query.number.length == 5)
	    req.query.number = S.substring(0,2) + '-' + S.substring(2);
	query = query.where('num', req.query.number);
    }
    if (req.query.semester) {
      query = query.where('semester', parseInt(req.query.semester));
    }
    // TODO figure out how to check for minis (best way)
    // Optional::

    if (req.query.instructor) {

    }

    if (req.query.building) {

    }

    query = query.select("-sections -__v -course_events");
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
    var course = req.params.course;
    var section = req.params.section.replace("-"," ");

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

    Course.findById(course, function(err, course) {
      if (err) {
        console.log(err);
        res.send(404);
      } else {
        res.send(course);
      }
    });
  });


  //returns the entire events array associated with an event
  app.get('/api/courses/:course/events', function(req, res) {
	  var course = req.params.course;

	  Course.findById(course, function(err, course) {
		  if (err) {
		      console.log(err);
		      res.send(404);
		  } else {
		      res.send(course.course_events);
		  }
	  });
  });


  app.post('/api/courses/:course/events', function(req, res) {
    if (req.body == null) {
      res.send("um no.");
    } else {
      // Values for validity of the event
      req.body.threshold = 0;
      req.body.state = 20; //No crowdsourcing for now!
      // Making sure the types check:
      req.body.start = Date(req.body.start);
      req.body.end = Date(req.body.end);
      req.body.recur = null; //For now
    }

	  Course.findById(req.params.course, function(err, course) {
      if (err || course == undefined) {
        console.log(err);
        res.send(404);
      } else {
        course.course_events.push(req.body);
        course.save(function (err) {
          if (err) {
            console.log(err);
            res.send(404); //Change to something appropriate
          } else {
            res.send(course);
          }
        });
      }
    });
  });

}
