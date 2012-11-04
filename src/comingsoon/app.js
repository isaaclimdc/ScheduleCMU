var express = require('express');
var app = express.createServer();

/* Redirect schedulecmu.org to www.schedulecmu.org */
app.all('*', function(req, res, next) {
  if (req.headers.host.slice(0, 3) == 'www') {
    next();
  } else {
    res.redirect(301, "http://www." + req.headers.host + req.url);
  }
});

/* Serve static files from the public directory */
app.use(express.static('public'));
app.listen(process.env.VCAP_APP_PORT || 3000);
