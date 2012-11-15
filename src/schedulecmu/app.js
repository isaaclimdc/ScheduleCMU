var express = require('express')
var app = express();

/* Serve static files from the public directory */
app.use(express.static('public'));
/* AppFog will pass the listen port as an env var called VCAP_APP_PORT */
app.listen(process.env.VCAP_APP_PORT || 3000);
