var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var app = express();

app.use(express.bodyParser());
app.use(express.methodOverride());

var db = require('./db.js').dbConnect(mongoose);
var Course = require('./course_model.js')(mongoose, db);
var User = require('./user_model.js')(mongoose, db);

require('./courses_api.js')(app, Course);
require('./users_api.js')(app, User);

/* Serve static files from the public directory */
app.use(express.static('public'));
/* AppFog will pass the listen port as an env var called VCAP_APP_PORT */
app.listen(process.env.VCAP_APP_PORT || 3000);
