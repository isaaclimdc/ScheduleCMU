var express = require('express');
var app = express.createServer();
/* Serve static files from the public directory */
app.use(express.static('public'));
app.listen(process.env.VCAP_APP_PORT || 3000);
