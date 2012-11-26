/* filter function that I borrowed from the web. I'd like to move this to another file
 *  abd reference that file in the HTML. I don't know which HTML file this is, so I'm leving it here for now */

/* may use a library like underscore.js instead to include functional programming tools */

if (!Array.prototype.filter)
    {
	Array.prototype.filter = function(fun /*, thisp*/)
	{
	    var len = this.length;
	    if (typeof fun != "function")
		throw new TypeError();

	    var res = new Array();
	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++)
		{
		    if (i in this)
			{
			    var val = this[i]; // in case fun mutates this
			    if (fun.call(thisp, val, i, this))
				res.push(val);
			}
		}

	    return res;
	};
    }


var express = require('express');
var app = express();

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var db = require('./db.js').dbConnect(mongoose);
var Course = require('./model.js').getCourseModel(Schema, db);

app.get('/api/courses', function(req, res) {
  var query = Course.find({});
  if (req.query.dept) {
    query = query.$where(function() {
      return (Math.floor(this.Num/1000) == req.query.dept)
    });
  }

  //Loose match on name - currently by whole words only
  if (req.query.name) {
      //words to be ignored in the query
      var ignoreWords = ['the', 'on', 'at', 'with', 'in', 'as', 'for', 'through', 
			 'of', 'his', 'a', 'and', 'an', 'or', 'to', 'from'];
      var queryWords = req.query.name.split(" ");

      //this will look prettier when I rewrite using lodash
      var searchWords = queryWords.filter(function (element, index, array){
	      if(element in ignoreWords){
		  return false;
	      }
	      return true;
	  });

      var regexString = searchWords.join('|');
      var regexPattern = new RegExp(regexString, 'i');
      query = query.where('Name').$regex(regexPattern);

      //now to select most relevant 10 of these queries
      //not sure if this is correct, but it's all I could think of 
      query.exec(function(err, courses) {
	      if (err) {
		  console.log(err);
	      }
	      var result = [];

	      for (var i = 0; i < courses.length; i++) {
		  var l = (courses[i].name.match(regexPattern)).length;
		  result[i] = l + ' ' + i;
	      }

	      //sort in descending order of number of matches in Name to regex string
	      result1 = result.sort(function(x, y){
		      a = x.split(' ');
		      b = y.split(' ');
		      if(a[0] < b[0]) return 1;
		      else if (a[0] > b[0]) return -1;
		      else return 0;
		  });

	      closestMatches = [];
	      for(var i = 0; i < ((courses.length < 10) ? courses.length : 10); i++){
		  var A = result1[i].split(' ');
		  closestMatches[i] = courses[A[1]];
	      }

	      //set the query to the ten (or less) closest matches
	      query = closestMatches;
	  });

  }
  	 
  if (req.query.number) {
    query = query.where('Num', parseInt(req.query.number));  
  }
  if (req.query.semester) {
    query = query.where('this.Semester', parseInt(req.query.semester));
  }
  if (req.query.mini) {
     query = query.where('this.Mini', parseInt(req.query.mini)); 
  }

  // Optional::

  //I don't remember whether instuctor is an array or a string and I can't find the schema.js file
  //kind of a loose match - not too great to find a course that both instructors are teaching
  //this can be easily implemented if required using the technique above
  if (req.query.instructor) {
      regexString = req.query.instructor.split(' ').join('|');
      regexPattern = new RegExp(regexString);
      query = query.where('Instructor').$regex(regexPattern);
  }

  //Assumes that all building names are upper case
  if (req.query.building) {
      regexPattern = new RegExp('^'+ (req.query.building).toUpperCase());
      query = query.where('Location').$regex(regexPattern);
  }

  query = query.select('-Sections');
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
