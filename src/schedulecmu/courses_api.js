module.exports = function (app, Course) {
  app.get('/api/courses', function(req, res) {
    var query = Course.find({});
    if (req.query.dept) {
        query = query.$where('this.num.match(/^' + req.query.dept + '/)'); 
    }
    if (req.query.name) {

    }
    if (req.query.number) {
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


  //returns the entire events array associated with an event
  app.get('/api/courses/:course/events', function(req, res) {
	  var course = req.params.course;
	  console.log(course);
	  Course.findById(course, function(err, course) {
		  if (err) {
		      console.log(err);
		      res.send(404);
		  } else {
		      res.send(course.course_events);
		  }
	  });
  });


  app.post('/api/events', function(req, res) {
          var event = req.body;
          if(event.event_type === undefined)
              res.send(405); //type unspecified                                                                                                             
          if(event.title === undefined)
              res.send(406); //name unspecified                                                                                                             
          if(event.date_time === undefined)
              res.send(407); //name unspecified                                                                                                             
          if(event.course_number === undefined)
              res.send(408); //name unspecified                                                                                                             
          if(!event.course_number.match(/^[0-9]{1,2}-[0-9]{3}$/))
	      res.send(409); //name is not in right format

	  if(event.course_id === undefined)
	      res.send(410); //id unspecified

	  if(event.loc === undefined)
	      event.loc = null;

          var current_course;
	  Course.findById(event.course_id, function(err, course) {
                  if (err) {
                      console.log(err);
                      res.send(404);
                  } else {
		      new_event = {
			  event_type : event.event_type,
			  title : event.title,
			  loc: event.loc,
			  date_time : event.date_time,
			  recur : null
		      }
                      course = course.course_events.push(new_event);
		      course.save();
		      res.send(course);
                  }
	      });
      });

}
